import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserData(userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) throw profileError;

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

  return { profile, formations, blocks };
}

export async function findSimilarFeedback(embedding: number[]) {
  return await supabase.rpc('match_feedback', {
    query_embedding: embedding,
    match_count: 5,
    match_threshold: 0.8
  });
}

export async function saveChatInteraction(sessionId: string, message: any, userId: string) {
  const { error } = await supabase
    .from('chat_history')
    .insert({
      session_id: sessionId,
      message: message,
      user_id: userId
    });

  if (error) throw error;
}