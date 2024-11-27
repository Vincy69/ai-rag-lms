import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { corsHeaders } from './utils/cors.ts';
import { callN8nWebhook } from './utils/n8nClient.ts';
import { generateEmbedding } from './utils/openai.ts';
import { getUserData, findSimilarFeedback, saveChatInteraction } from './utils/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    console.log('Received message:', message);
    console.log('User ID:', userId);

    // Get user data
    const { profile, formations, blocks } = await getUserData(userId);

    // Generate embedding and find similar feedback
    const embedding = await generateEmbedding(message);
    const { data: similarFeedback } = await findSimilarFeedback(embedding);

    // Prepare context
    const feedbackContext = similarFeedback?.length > 0
      ? `\nPrevious relevant feedback: ${similarFeedback.map(f => f.feedback).join('. ')}`
      : '';
    
    // Prepare request body for n8n
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
    };
    
    console.log('Sending request to n8n:', requestBody);
    
    const data = await callN8nWebhook(requestBody);
    console.log('Processed n8n response:', data);

    // Save chat interaction
    await saveChatInteraction(requestBody.sessionId, {
      input: message,
      output: data.response,
      score: data.confidence,
      feedback: null
    }, userId);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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