require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

async function inspect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "Please set MONGODB_URI in .env.local before running this script."
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const dbName = uri.split("/").pop().split("?")[0] || "easysched_dev_suv";
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log("Database:", dbName);
    console.log("Collections:");
    for (const c of collections) {
      const name = c.name;
      const count = await db.collection(name).countDocuments();
      console.log(` - ${name} (count: ${count})`);
    }

    async function sample(name) {
      const col = db.collection(name);
      const docs = await col.find({}).limit(3).toArray();
      console.log(`\nSample documents from ${name}:`);
      if (docs.length === 0) console.log("  (no documents)");
      docs.forEach((d, i) => {
        console.log(`  [${i}]`, JSON.stringify(d, null, 2));
      });
    }

    // Inspect typical collections
    const inspectNames = ["users", "clients"];
    for (const name of inspectNames) {
      const exists = collections.some((c) => c.name === name);
      if (exists) await sample(name);
      else console.log(`\nCollection '${name}' not found.`);
    }
  } catch (err) {
    console.error("Error inspecting DB:", err);
  } finally {
    await client.close();
  }
}

inspect();
