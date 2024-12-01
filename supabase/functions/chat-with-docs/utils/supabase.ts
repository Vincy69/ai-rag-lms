import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getUserData(userId: string) {
  console.log('Getting user data for userId:', userId);

  // Get user learning data from the view
  const { data: learningData, error: learningError } = await supabase
    .from('user_learning_data')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (learningError) {
    console.error('Error fetching user learning data:', learningError);
    throw learningError;
  }

  console.log('Retrieved learning data:', learningData);

  // If no data is found, get basic profile info
  if (!learningData) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    return { profile };
  }

  return learningData;
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