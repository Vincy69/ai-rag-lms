import { Pinecone } from '@pinecone-database/pinecone';

const PINECONE_API_KEY = 'pcsk_nv6Gw_BqfSG3WczY3ft9kAofzDAn66khKLLDEp494gXvHD5QLdY4Ak9yK5FCFJMgHT2a4';
const PINECONE_ENVIRONMENT = 'gcp-starter';
const PINECONE_INDEX = 'elephorm';

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient() {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

export async function getPineconeIndex() {
  const client = await getPineconeClient();
  return client.index(PINECONE_INDEX);
}