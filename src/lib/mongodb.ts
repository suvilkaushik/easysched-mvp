import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let client: MongoClient | null = null;

export async function connectToDatabase(): Promise<MongoClient> {
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment");
  }

  if (client && (client as any).isConnected && (client as any).isConnected()) {
    return client;
  }

  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export default connectToDatabase;
