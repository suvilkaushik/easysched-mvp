import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/easysched-dev";
const dbName = process.env.MONGODB_DB || "easysched-dev";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const res = await db.collection("users").deleteMany({});
    console.log("Deleted documents count:", res.deletedCount);
  } catch (err) {
    console.error("Error clearing users:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
