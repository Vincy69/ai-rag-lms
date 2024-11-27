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
    try {
      pineconeClient = new Pinecone({
        apiKey: PINECONE_API_KEY,
        environment: PINECONE_ENVIRONMENT,
      });
      console.log('Pinecone client initialized successfully');
    } catch (error) {
      console.error('Error initializing Pinecone client:', error);
      throw new Error('Failed to initialize Pinecone client');
    }
  }
  return pineconeClient;
}

export async function getPineconeIndex() {
  try {
    const client = await getPineconeClient();
    const index = client.Index(PINECONE_INDEX);
    console.log('Successfully got Pinecone index');
    return index;
  } catch (error) {
    console.error('Error getting Pinecone index:', error);
    throw new Error('Failed to get Pinecone index');
  }
}

export async function getVectorStore() {
  if (!vectorStore) {
    try {
      const index = await getPineconeIndex();
      
      // Use type assertion to match LangChain's expected type
      vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({
          openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        }), 
        {
          pineconeIndex: index as any, // Type assertion needed for compatibility
          namespace: PINECONE_INDEX,
        }
      );
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw new Error('Failed to initialize vector store');
    }
  }
  return vectorStore;
}