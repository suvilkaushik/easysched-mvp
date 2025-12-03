import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = global._mongoClientPromise || client.connect();

declare global {
  // allow global `var` declarations for the dev environment to preserve client across HMR
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV !== "production")
  global._mongoClientPromise = clientPromise;

export { clientPromise };

// Usage:
// import { clientPromise } from '@/lib/mongodb';
// const client = await clientPromise;
// const db = client.db('easysched_dev_suv');
