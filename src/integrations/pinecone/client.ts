import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';

const PINECONE_API_KEY = import.meta.env.VITE_PINECONE_API_KEY;
const PINECONE_INDEX = import.meta.env.VITE_PINECONE_INDEX_NAME || 'elephorm';
const PINECONE_ENVIRONMENT = import.meta.env.VITE_PINECONE_ENV || 'gcp-starter';

if (!PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is not set');
}

let pineconeClient: Pinecone | null = null;
let vectorStore: PineconeStore | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
      environment: PINECONE_ENVIRONMENT
    });
  }
  return pineconeClient;
}

export async function getPineconeIndex() {
  const client = await getPineconeClient();
  const index = client.Index(PINECONE_INDEX);
  return index;
}

export async function getVectorStore() {
  if (!vectorStore) {
    const index = await getPineconeIndex();
    
    vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      }), 
      {
        pineconeIndex: index as any, // Type assertion to avoid compatibility issues
        namespace: PINECONE_INDEX,
      }
    );
  }
  return vectorStore;
}