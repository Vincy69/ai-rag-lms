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
      } catch (e) {
        console.log('Response is not JSON:', e);
        throw new Error('Invalid JSON response from n8n');
      }
      
      if (!response.ok) {
        throw new Error(`n8n workflow error: ${JSON.stringify(data)}`);
      }

      // Extract the response from n8n's data structure
      if (data.data && typeof data.data === 'string') {
        return { response: data.data };
      }
      
      if (data.result && data.result.response) {
        return { response: data.result.response };
      }

      if (data.response) {
        return { response: data.response };
      }

      if (data.message) {
        return { response: data.message };
      }

      console.log('Unexpected response format:', data);
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
  
  throw new Error(`Échec de la communication avec n8n après ${retries} tentatives. Dernière erreur: ${lastError?.message}`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    console.log('Received message:', message)
    
    const requestBody = {
      sessionId: crypto.randomUUID(),
      chatInput: message,
      metadata: {
        timestamp: new Date().toISOString()
      }
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

    // Save the chat interaction to the database
    const { error: insertError } = await supabase
      .from('chat_history')
      .insert({
        question: message,
        answer: data.response,
        score: 0 // Default score, can be updated later with feedback
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
        error: "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer.",
        details: error.message,
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