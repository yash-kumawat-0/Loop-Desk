import { LemmaClient } from "lemma-sdk";

const client = new LemmaClient();

export const clientReady = client.initialize();
export default client;
