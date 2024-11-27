import { corsHeaders } from './cors.ts';

interface N8nResponse {
  response: string;
  confidence: number;
}

export async function callN8nWebhook(requestBody: { sessionId: string; input: string; userId: string }): Promise<N8nResponse> {
  const n8nUrl = 'https://elephorm.app.n8n.cloud/webhook/a7cc35a6-3fdf-4e2e-859a-5c16a15f0b99/chat';
  
  try {
    console.log('Calling n8n webhook with body:', JSON.stringify(requestBody));
    
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error(`n8n webhook error: ${response.status}`);
      throw new Error(`n8n webhook error: ${response.status}`);
    }

    const rawResponse = await response.text();
    console.log('Raw n8n response:', rawResponse);

    if (!rawResponse) {
      throw new Error('Empty response from n8n');
    }

    const data = JSON.parse(rawResponse);
    console.log('Parsed n8n response:', data);

    if (data.error || data.message === "Error in workflow") {
      throw new Error(`n8n workflow error: ${JSON.stringify(data)}`);
    }

    // Handle different response formats
    if (typeof data === 'string') {
      return { response: data, confidence: 0.8 };
    }

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (typeof firstItem === 'string') {
        return { response: firstItem, confidence: 0.8 };
      }
      if (firstItem.output) {
        return { 
          response: firstItem.output,
          confidence: firstItem.confidence || 0.8
        };
      }
    }

    if (data.output) {
      return { 
        response: data.output,
        confidence: data.confidence || 0.8
      };
    }

    throw new Error(`Unexpected response format from n8n: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('n8n webhook error:', error);
    throw error;
  }
}