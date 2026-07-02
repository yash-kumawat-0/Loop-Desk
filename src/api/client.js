import { LemmaClient } from "lemma-sdk";

const client = new LemmaClient({ podId: import.meta.env.VITE_LEMMA_POD_ID });

export const clientReady = client.initialize();
export default client;
