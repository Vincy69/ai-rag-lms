import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Updated n8n webhook URL - make sure this matches your n8n webhook URL
    const n8nUrl = 'https://n8n.elephorm.app/webhook/fa2836ec-b77c-49aa-8ed0-bf5dac24da66/chat'
    
    // Send message to n8n chat trigger with better error handling
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      console.error('n8n response not ok:', {
        status: response.status,
        statusText: response.statusText,
        url: n8nUrl,
        body: await response.text()
      })
      throw new Error(`n8n returned status ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('n8n response:', data)

    // Ensure we have a response from n8n
    if (!data || !data.response) {
      throw new Error('Invalid response format from n8n')
    }

    return new Response(
      JSON.stringify({ response: data.response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    
    // Return a more detailed error response
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