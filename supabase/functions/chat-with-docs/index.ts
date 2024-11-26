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
    
    // Ajout de logs pour le debugging
    console.log('Received message:', message)
    
    // Send message to n8n webhook
    const response = await fetch('https://elephorm.app.n8n.cloud/webhook/fa2836ec-b77c-49aa-8ed0-bf5dac24da66/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      console.error('n8n response not ok:', response.status, response.statusText)
      throw new Error('Failed to get response from n8n')
    }

    const data = await response.json()
    console.log('n8n response:', data)

    return new Response(
      JSON.stringify({ response: data.response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})