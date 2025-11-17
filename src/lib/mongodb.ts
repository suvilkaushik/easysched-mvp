import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let client: MongoClient | undefined;

export async function getClient(): Promise<MongoClient> {
  if (client) return client;
  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function getDb() {
  const c = await getClient();
  // The DB name should be part of the URI, but fallback to 'easysched_dev_suv'
  const dbName =
    new URL(uri).pathname.replace(/^\//, "") || "easysched_dev_suv";
  return c.db(dbName);
}

export default getDb;
