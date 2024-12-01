import { corsHeaders } from './cors.ts';

interface N8nResponse {
  response: string;
  confidence?: number;
}

export async function callN8nWebhook(requestBody: { sessionId: string; input?: string; userId: string; action?: string; userData?: any }): Promise<N8nResponse> {
  // Remove any trailing slashes and ensure proper URL format
  const baseUrl = 'https://elephorm.app.n8n.cloud';
  const webhookPath = '/webhook/a7cc35a6-3fdf-4e2e-859a-5c16a15f0b99/chat';
  const n8nUrl = `${baseUrl}${webhookPath}`;
  
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
      
      // Handle specific error cases
      if (response.status === 404 || response.status === 503) {
        throw new Error('N8n workflow is not active. Please activate the workflow in n8n.');
      }
      
      if (response.status === 500) {
        throw new Error('Error in n8n workflow execution. Please check the workflow configuration.');
      }

      throw new Error(`n8n webhook failed (${response.status}): ${errorText}`);
    }

    const rawResponse = await response.text();
    console.log('Raw n8n response:', rawResponse);

    if (!rawResponse || rawResponse.trim() === '') {
      throw new Error('Empty response from n8n');
    }

    try {
      const data = JSON.parse(rawResponse);
      console.log('Parsed n8n response:', data);

      // Check for empty or invalid response
      if (!data || Object.keys(data).length === 0 || (Object.keys(data).length === 1 && data[''] === '')) {
        throw new Error('Invalid empty response from n8n');
      }

      // Handle different response formats
      if (typeof data === 'string') {
        return { response: data };
      }

      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === 'string') {
          return { response: firstItem };
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