export async function generateEmbedding(text: string): Promise<number[]> {
  console.log('Generating embedding with text-embedding-3-small model...');
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const { data: [{ embedding }] } = await response.json();
  console.log('Successfully generated embedding');
  return embedding;
}