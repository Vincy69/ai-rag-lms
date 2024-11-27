import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { OpenAIEmbeddings } from 'https://esm.sh/@langchain/openai@0.0.7'
import { Document } from 'https://esm.sh/langchain/document'
import { RecursiveCharacterTextSplitter } from 'https://esm.sh/langchain/text_splitter'
import { PineconeStore } from 'https://esm.sh/@langchain/pinecone@0.0.1'
import { Pinecone } from 'https://esm.sh/@pinecone-database/pinecone@1.1.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PINECONE_API_KEY = 'pcsk_nv6Gw_BqfSG3WczY3ft9kAofzDAn66khKLLDEp494gXvHD5QLdY4Ak9yK5FCFJMgHT2a4';
const PINECONE_INDEX = 'elephorm';
const PINECONE_ENVIRONMENT = 'gcp-starter';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Processing document request...');
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

    console.log('Uploading file:', file.name, 'to path:', filePath);

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

    // Extract text content
    let textContent = ''
    if (file.type === 'application/pdf') {
      // TODO: Extract text from PDF using PDF.js or similar
      textContent = 'PDF content extraction to be implemented'
    } else if (file.type === 'text/plain') {
      textContent = await blob.text()
    } else {
      textContent = `${file.name} - Document content extraction not implemented for this type`
    }

    // Split text into chunks using LangChain
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    console.log('Creating document chunks...');
    const docs = await splitter.createDocuments([textContent], [{
      source: file.name,
      type: file.type,
      category: category
    }]);

    try {
      console.log('Initializing Pinecone...');
      // Initialize Pinecone with proper configuration
      const pinecone = new Pinecone({
        apiKey: PINECONE_API_KEY,
        environment: PINECONE_ENVIRONMENT,
      });

      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: Deno.env.get('OPENAI_API_KEY'),
      });

      console.log('Getting Pinecone index...');
      const index = pinecone.Index(PINECONE_INDEX);
      
      console.log('Creating vector store...');
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: "default",
      });

      console.log('Adding documents to vector store...');
      await vectorStore.addDocuments(docs);
    } catch (error) {
      console.error('Pinecone error:', error);
      throw new Error(`Pinecone processing failed: ${error.message}`);
    }

    // Save document metadata to database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        name: file.name,
        category,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        message: 'Document processed successfully', 
        filePath,
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