import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PineconeClient } from 'https://esm.sh/@pinecone-database/pinecone@1.1.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PINECONE_API_KEY = 'pcsk_nv6Gw_BqfSG3WczY3ft9kAofzDAn66khKLLDEp494gXvHD5QLdY4Ak9yK5FCFJMgHT2a4';
const PINECONE_ENVIRONMENT = 'gcp-starter';
const PINECONE_INDEX = 'elephorm';

const MAX_TEXT_LENGTH = 8000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { file, category } = await req.json()

    if (!file || !file.data) {
      throw new Error('No file data provided')
    }

    // Convert base64 data URL to blob
    const base64Data = file.data.split(',')[1]
    const binaryData = atob(base64Data)
    const bytes = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i)
    }
    
    const blob = new Blob([bytes], { type: file.type })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate unique file path
    const fileExt = file.name.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    console.log('Uploading file:', file.name, 'to path:', filePath)

    // Upload file to Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, blob, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw uploadError
    }

    // Extract text content for vectorization
    let textContent = ''
    if (file.type === 'application/pdf') {
      // TODO: Extract text from PDF using PDF.js or similar
      textContent = 'PDF content extraction to be implemented'
    } else if (file.type === 'text/plain') {
      textContent = await blob.text()
    } else {
      textContent = `${file.name} - Document content extraction not implemented for this type`
    }

    // Truncate text to avoid token limit issues
    textContent = textContent.slice(0, MAX_TEXT_LENGTH)

    // Generate embedding using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: textContent,
        model: "text-embedding-3-small"
      })
    })

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const embedData = await openAIResponse.json()
    const embedding = embedData.data[0].embedding

    // Initialize Pinecone client
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: PINECONE_API_KEY,
      environment: PINECONE_ENVIRONMENT,
    });

    const index = pinecone.Index(PINECONE_INDEX);
    const pineconeId = crypto.randomUUID();

    // Upsert the embedding to Pinecone
    await index.upsert({
      upsertRequest: {
        vectors: [{
          id: pineconeId,
          values: embedding,
          metadata: {
            text: textContent,
            fileName: file.name,
            fileType: file.type
          }
        }]
      }
    });

    // Save document metadata to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        category,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
        pinecone_id: pineconeId
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Document processed successfully', 
        filePath,
        pineconeId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Process document error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})