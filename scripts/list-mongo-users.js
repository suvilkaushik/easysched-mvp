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
    const users = await db.collection("users").find({}).toArray();
    console.log("MongoDB users count:", users.length);
    for (const u of users) {
      console.log(
        "clerkUserId:",
        u.clerkUserId || "N/A",
        "email:",
        u.email || "N/A",
        "fullName:",
        u.fullName || "N/A",
        "createdAt:",
        u.createdAt ? new Date(u.createdAt).toISOString() : "N/A"
      );
    }
  } catch (e) {
    console.error("list error", e && e.message);
  } finally {
    await client.close();
  }
})();
