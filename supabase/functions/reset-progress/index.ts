import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  user_id: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json() as WebhookPayload

    // Reset quiz attempts
    await supabaseClient
      .from('quiz_attempts')
      .delete()
      .eq('user_id', user_id)

    // Reset lesson progress
    await supabaseClient
      .from('lesson_progress')
      .delete()
      .eq('user_id', user_id)

    // Reset skill progress
    await supabaseClient
      .from('skill_progress')
      .delete()
      .eq('user_id', user_id)

    // Reset block enrollments progress
    await supabaseClient
      .from('block_enrollments')
      .update({ 
        progress: 0,
        status: 'in_progress',
        completed_at: null
      })
      .eq('user_id', user_id)

    // Reset formation enrollments progress
    await supabaseClient
      .from('formation_enrollments')
      .update({ 
        progress: 0,
        status: 'in_progress',
        completed_at: null
      })
      .eq('user_id', user_id)

    return new Response(
      JSON.stringify({ message: 'Progress reset successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})