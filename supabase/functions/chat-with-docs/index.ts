import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to connect to n8n...`);
      
      const response = await fetch(url, options);
      console.log(`n8n response status: ${response.status}`);
      
      // Check if response is HTML (indicating n8n error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('n8n server returned HTML instead of JSON. The server might be down.');
      }

      const rawResponse = await response.text();
      console.log('Raw n8n response:', rawResponse);
      
      let data;
      try {
        data = JSON.parse(rawResponse);
        console.log('Parsed n8n response:', data);
      } catch (e) {
        console.log('Response is not JSON:', e);
        throw new Error(`Invalid response from n8n: ${rawResponse.slice(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(`n8n workflow error: ${JSON.stringify(data)}`);
      }

      // Try to extract the response and confidence score from various possible formats
      if (Array.isArray(data)) {
        console.log('Response is an array');
        if (data.length > 0) {
          if (data[0].output && data[0].confidence) {
            console.log('Found output and confidence in array[0]:', data[0]);
            return { 
              response: data[0].output,
              confidence: parseFloat(data[0].confidence) || 0.8
            };
          }
          if (typeof data[0] === 'string') {
            console.log('Found string in array[0]:', data[0]);
            return { response: data[0], confidence: 0.8 };
          }
        }
      }

      if (typeof data === 'string') {
        console.log('Response is a string:', data);
        return { response: data, confidence: 0.8 };
      }

      if (data.output) {
        console.log('Found output property:', data.output);
        return { 
          response: data.output,
          confidence: parseFloat(data.confidence) || 0.8
        };
      }

      console.log('Unexpected response structure. Full response:', JSON.stringify(data, null, 2));
      throw new Error('Format de réponse inattendu de n8n');
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      
      if (i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Waiting ${delay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Échec inattendu de la communication avec n8n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    console.log('Received message:', message)

    // Generate embedding for the message to find similar feedback
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error('Error generating embedding');
    }

    const { data: [{ embedding }] } = await embeddingResponse.json();

    // Find similar feedback using the match_feedback function
    const { data: similarFeedback } = await supabase.rpc('match_feedback', {
      query_embedding: embedding,
      match_count: 5,
      match_threshold: 0.8
    });

    // Add relevant feedback to the context if any was found
    const feedbackContext = similarFeedback?.length > 0
      ? `\nPrevious relevant feedback: ${similarFeedback.map(f => f.feedback).join('. ')}`
      : '';
    
    const requestBody = {
      sessionId: crypto.randomUUID(),
      chatInput: message + feedbackContext,
      metadata: {
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('Sending request to n8n:', requestBody)

    // Fixed the URL by removing the colon after the domain
    const n8nUrl = 'https://elephorm.app.n8n.cloud/webhook/a7cc35a6-3fdf-4e2e-859a-5c16a15f0b99/chat'
    
    const data = await fetchWithRetry(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Processed n8n response:', data);

    // Save the chat interaction with the confidence score to the database
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert({
        question: message,
        answer: data.response,
        score: data.confidence
      });

    if (insertError) {
      console.error('Error saving chat history:', insertError);
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer.",
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})