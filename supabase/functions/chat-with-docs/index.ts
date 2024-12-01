import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders } from './utils/cors.ts'
import { callN8nWebhook } from './utils/n8nClient.ts'
import { getUserData } from './utils/supabase.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, action, chatInput: message, userId } = await req.json();
    console.log('Received request:', { sessionId, action, message, userId });

    if (!userId) {
      throw new Error('userId is required');
    }

    // Handle welcome message generation
    if (action === "getWelcomeMessage") {
      console.log('Getting welcome message for user:', userId);
      
      // Get user learning data
      const userData = await getUserData(userId);
      console.log('User data retrieved:', userData);

      // Prepare request body for n8n
      const requestBody = {
        sessionId,
        action: "getWelcomeMessage",
        userId,
        userData
      };
      
      console.log('Sending welcome message request to n8n:', requestBody);
      
      const data = await callN8nWebhook(requestBody);
      console.log('Processed n8n response:', data);

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle regular chat messages
    if (action === "sendMessage") {
      if (!message) {
        throw new Error('Message is required for sendMessage action');
      }

      // Prepare simplified request body for n8n
      const requestBody = {
        sessionId,
        input: message,
        userId: userId
      };
      
      console.log('Sending chat message to n8n:', requestBody);
      
      try {
        const data = await callN8nWebhook(requestBody);
        console.log('Processed n8n response:', data);

        if (!data || !data.response) {
          throw new Error('Invalid response format from n8n');
        }

        return new Response(
          JSON.stringify(data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('n8n webhook error:', error);
        
        // Handle specific error cases
        if (error.message.includes('workflow is not active')) {
          return new Response(
            JSON.stringify({ 
              error: 'N8n workflow is not active',
              details: 'N8n workflow is not active. Please activate the workflow in n8n.',
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 503
            }
          );
        }
        
        if (error.message.includes('Error in n8n workflow execution')) {
          return new Response(
            JSON.stringify({ 
              error: 'N8n workflow error',
              details: error.message,
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
          );
        }

        throw error;
      }
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while processing your request. Please try again.",
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});