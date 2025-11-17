import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI in environment");

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb(dbName?: string): Promise<Db> {
  if (cachedDb) return cachedDb;
  const client = await getClient();
  const name =
    dbName ||
    client.options?.dbName ||
    process.env.MONGODB_DB ||
    (uri && uri.split("/").pop().split("?")[0]);
  if (!name)
    throw new Error(
      "Database name not provided (pass dbName or set MONGODB_DB)"
    );
  const db = client.db(name);
  cachedDb = db;
  return db;
}

export default getDb;
