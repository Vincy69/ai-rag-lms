import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error(`Attempt ${i + 1} failed:`, {
          status: response.status,
          statusText: response.statusText,
          body: await response.text()
        });
        continue;
      }
      
      const data = await response.json();
      console.log('n8n response:', data);
      
      // Validate response format
      if (!data || (typeof data.response !== 'string' && typeof data.message !== 'string')) {
        throw new Error('Invalid response format from n8n. Expected response or message property.');
      }
      
      return {
        response: data.response || data.message // Handle both possible response formats
      };
    } catch (error) {
      console.error(`Attempt ${i + 1} failed with error:`, error);
      if (i === retries - 1) throw error;
    }
    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
  }
  throw new Error(`Failed after ${retries} attempts`);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    
    console.log('Received message:', message)
    
    // Format the request body for n8n chat trigger
    const requestBody = {
      message: message,
      sessionId: crypto.randomUUID() // Add a session ID for tracking
    }
    
    console.log('Sending request to n8n:', requestBody)

    // Updated n8n webhook URL with the correct format
    const n8nUrl = 'https://elephorm.app.n8n.cloud/webhook/fa2836ec-b77c-49aa-8ed0-bf5dac24da66/chat'
    
    // Send message to n8n chat trigger with retry logic
    const data = await fetchWithRetry(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Processed n8n response:', data);

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
        error: error.message,
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