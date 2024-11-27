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
      
      const rawResponse = await response.text();
      console.log('Raw n8n response:', rawResponse);
      
      let data;
      try {
        data = JSON.parse(rawResponse);
        console.log('Parsed n8n response:', data);

        if (data.error || data.message === "Error in workflow") {
          throw new Error(`n8n workflow error: ${JSON.stringify(data)}`);
        }
      } catch (e) {
        console.error('Failed to parse JSON response:', e);
        throw new Error(`Invalid JSON response from n8n: ${rawResponse.slice(0, 100)}...`);
      }
      
      if (typeof data === 'string') {
        return { response: data, confidence: 0.8 };
      }

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'string') {
          return { response: firstItem, confidence: 0.8 };
        }
        if (firstItem.output) {
          return { 
            response: firstItem.output,
            confidence: firstItem.confidence || 0.8
          };
        }
      }

      if (data.output) {
        return { 
          response: data.output,
          confidence: data.confidence || 0.8
        };
      }

      throw new Error(`Unexpected response format from n8n: ${JSON.stringify(data)}`);
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
  
  throw lastError || new Error('Failed to communicate with n8n');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()
    
    console.log('Received message:', message)
    console.log('User ID:', userId)

    // Récupérer les informations de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Récupérer les formations de l'utilisateur
    const { data: formations, error: formationsError } = await supabase
      .from('formation_enrollments')
      .select(`
        formations (
          id,
          name,
          description
        ),
        progress,
        status
      `)
      .eq('user_id', userId);

    if (formationsError) throw formationsError;

    // Récupérer les blocs de l'utilisateur
    const { data: blocks, error: blocksError } = await supabase
      .from('block_enrollments')
      .select(`
        skill_blocks (
          id,
          name,
          description
        ),
        progress,
        status
      `)
      .eq('user_id', userId);

    if (blocksError) throw blocksError;

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
      input: message + feedbackContext,
      user: {
        id: userId,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name
      },
      formations: formations.map(f => ({
        name: f.formations.name,
        progress: f.progress,
        status: f.status
      })),
      blocks: blocks.map(b => ({
        name: b.skill_blocks.name,
        progress: b.progress,
        status: b.status
      })),
      timestamp: new Date().toISOString()
    }
    
    console.log('Sending request to n8n:', requestBody)

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
        session_id: requestBody.sessionId,
        message: {
          input: message,
          output: data.response,
          score: data.confidence,
          feedback: null
        },
        user_id: userId
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