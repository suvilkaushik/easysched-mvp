require("dotenv").config({ path: "./.env.local" });
const { MongoClient } = require("mongodb");

(async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in environment");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("easysched_dev_suv");
    const clients = await db.collection("clients").find({}).toArray();
    console.log("MongoDB clients count:", clients.length);
    for (const c of clients) {
      console.log(
        "ownerClerkId:",
        c.ownerClerkId || "N/A",
        "name:",
        c.name || "N/A",
        "email:",
        c.email || "N/A",
        "phone:",
        c.phone || "N/A",
        "serviceAddress:",
        c.serviceAddress || "N/A",
        "createdAt:",
        c.createdAt ? new Date(c.createdAt).toISOString() : "N/A"
      );
    }
  } catch (e) {
    console.error("list error", e && e.message);
  } finally {
    await client.close();
  }
})();
