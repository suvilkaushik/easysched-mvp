#!/usr/bin/env node
require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local or environment");
    process.exit(1);
  }

  const dbName =
    process.env.MONGODB_DB ||
    process.env.NEXT_PUBLIC_MONGODB_DB ||
    (uri && uri.split("/").pop().split("?")[0]) ||
    "easysched_dev_suv";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  try {
    const db = client.db(dbName);
    console.log("Database:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("Collections:");
    for (const c of collections) {
      const coll = db.collection(c.name);
      const count = await coll.countDocuments();
      console.log(` - ${c.name} (count: ${count})`);
    }

    async function sample(name) {
      const col = db.collection(name);
      const docs = await col.find({}).limit(3).toArray();
      console.log(`\nSample documents from ${name}:`);
      if (docs.length === 0) console.log("  (no documents)");
      docs.forEach((d, i) => {
        // convert ObjectId to string for readability
        if (d._id && d._id.toString) d._id = d._id.toString();
        console.log(`  [${i}]`, JSON.stringify(d, null, 2));
      });
    }

    // show samples for users and clients if present
    const inspectNames = ["users", "clients"];
    for (const name of inspectNames) {
      const exists = collections.some((c) => c.name === name);
      if (exists) await sample(name);
      else console.log(`\nCollection '${name}' not found.`);
    }
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
