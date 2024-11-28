import { corsHeaders } from './cors.ts';

interface N8nResponse {
  response: string;
  confidence?: number;
}

export async function callN8nWebhook(requestBody: { sessionId: string; input: string; userId: string }): Promise<N8nResponse> {
  // Updated URL format to match n8n's webhook URL structure
  const n8nUrl = 'https://elephorm.app.n8n.cloud/webhook/chat';
  
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
      const errorText = await response.text();
      console.error(`n8n webhook error (${response.status}):`, errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        if (response.status === 404) {
          throw new Error('N8n workflow is not active. Please activate the workflow in n8n.');
        }
        throw new Error(`n8n workflow error: ${errorJson.message || errorText}`);
      } catch (e) {
        if (e.message.includes('workflow is not active')) {
          throw e;
        }
        throw new Error(`n8n webhook failed (${response.status}): ${errorText}`);
      }
    }

    const rawResponse = await response.text();
    console.log('Raw n8n response:', rawResponse);

    if (!rawResponse) {
      throw new Error('Empty response from n8n');
    }

    try {
      const data = JSON.parse(rawResponse);
      console.log('Parsed n8n response:', data);

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

      if (data.response) {
        return {
          response: data.response,
          confidence: data.confidence || 0.8
        };
      }

      throw new Error(`Unexpected response format from n8n: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error('Error parsing n8n response:', error);
      throw new Error(`Failed to parse n8n response: ${error.message}`);
    }
  } catch (error) {
    console.error('n8n webhook error:', error);
    throw error;
  }
}