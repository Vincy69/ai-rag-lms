import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import type { Index as PineconeIndex } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY || 'pcsk_nv6Gw_BqfSG3WczY3ft9kAofzDAn66khKLLDEp494gXvHD5QLdY4Ak9yK5FCFJMgHT2a4';
const PINECONE_INDEX = 'cours';
const PINECONE_ENVIRONMENT = 'gcp-starter';

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

export async function getPineconeIndex(): Promise<PineconeIndex> {
  const client = await getPineconeClient();
  return client.Index(PINECONE_INDEX);
}

export async function getVectorStore() {
  if (!vectorStore) {
    const index = await getPineconeIndex();

    vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      }), 
      {
        pineconeIndex: index,
        namespace: PINECONE_INDEX,
      }
    );
  }
  return vectorStore;
}