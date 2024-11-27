export async function generateEmbedding(text: string): Promise<number[]> {
  console.log('Generating embedding with text-embedding-3-small model...');
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('Error generating embedding');
  }

  const { data: [{ embedding }] } = await response.json();
  console.log('Successfully generated embedding');
  return embedding;
}