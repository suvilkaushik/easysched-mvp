import { MongoClient } from "mongodb";
import bcryptPkg from "bcryptjs";
const { hash } = bcryptPkg;

const uri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/easysched-dev";
const dbName = process.env.MONGODB_DB || "easysched-dev";

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    // Example test users
    const testUsers = [
      {
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      },
      {
        name: "Alice Example",
        email: "alice@example.com",
        password: "AlicePass1!",
      },
    ];

    // Hash passwords and insert
    const docs = [];
    for (const u of testUsers) {
      const pwHash = await hash(u.password, 10);
      docs.push({
        name: u.name,
        email: u.email,
        passwordHash: pwHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const res = await users.insertMany(docs);
    console.log("Inserted test users:", res.insertedCount);
  } catch (err) {
    console.error("Error seeding users:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
