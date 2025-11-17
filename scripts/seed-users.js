#!/usr/bin/env node
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const fs = require("fs");

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName =
    process.env.MONGODB_DB ||
    process.env.NEXT_PUBLIC_MONGODB_DB ||
    (uri && uri.split("/").pop().split("?")[0]) ||
    "easysched_dev_suv";
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local or environment");
    process.exit(1);
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  try {
    const db = client.db(dbName);

    const seed = [
      { email: "alice@example.com", password: "TestPass123!", name: "Alice" },
      { email: "bob@example.com", password: "Password!234", name: "Bob" },
    ];

    const out = [];
    for (const s of seed) {
      const now = new Date();
      const passwordHash = await bcrypt.hash(s.password, 10);
      // upsert user to satisfy validators
      const res = await db.collection("users").findOneAndUpdate(
        { email: s.email },
        {
          $set: {
            name: s.name,
            email: s.email,
            passwordHash,
            role: "user",
            isDisabled: false,
            emailVerified: null,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      const uid =
        (res.value && res.value._id) ||
        (res.lastErrorObject && res.lastErrorObject.upserted);
      const userId = uid ? uid.toString() : undefined;

      // create a client linked to userId if not exists
      if (userId) {
        await db.collection("clients").insertOne({
          name: `${s.name}'s Client`,
          owner: userId,
          createdAt: now,
          updatedAt: now,
        });
      }

      out.push({ email: s.email, password: s.password, id: userId });
    }

    const credPath = "./scripts/sample-credentials.txt";
    const content =
      out
        .map(
          (o) =>
            `email: ${o.email}  password: ${o.password}${
              o.id ? `  id: ${o.id}` : ""
            }`
        )
        .join("\n") + "\n";
    fs.writeFileSync(credPath, content);
    console.log("Seed complete. Credentials written to", credPath);
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
