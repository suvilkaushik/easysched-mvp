require("dotenv").config({ path: "./.env.local" });
const { MongoClient } = require("mongodb");
const sdk = require("@clerk/clerk-sdk-node");

(async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

  if (!MONGODB_URI || !CLERK_SECRET_KEY) {
    console.error("Missing MONGODB_URI or CLERK_SECRET_KEY in environment");
    process.exit(1);
  }

  const client = sdk.createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const mongoClient = new MongoClient(MONGODB_URI);

  try {
    await mongoClient.connect();
    const db = mongoClient.db("easysched_dev_suv");

    // Fetch all Clerk users
    const clerkUsers = [];
    let cursor = undefined;
    while (true) {
      const query = { limit: 100 };
      if (cursor) query["starting_after"] = cursor;
      const res = await client.users.request({
        method: "GET",
        path: "/users",
        queryParams: query,
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      if (!Array.isArray(list) || list.length === 0) break;
      clerkUsers.push(...list);
      cursor = list[list.length - 1].id;
      if (list.length < 100) break;
    }

    console.log(`Found ${clerkUsers.length} Clerk users.`);

    for (const cu of clerkUsers) {
      const clerkUserId = cu.id;
      const email = (
        cu.email_address ||
        cu.email ||
        cu.emailAddress ||
        (cu.emailAddresses && cu.emailAddresses[0]?.emailAddress) ||
        (cu._raw &&
          cu._raw.email_addresses &&
          cu._raw.email_addresses[0]?.email_address) ||
        ""
      ).toLowerCase();
      const fullName =
        cu.first_name && cu.last_name
          ? `${cu.first_name} ${cu.last_name}`
          : cu.first_name || cu.last_name || undefined;
      const createdAt = cu.created_at ? new Date(cu.created_at) : new Date();

      if (!clerkUserId) continue;

      // Check if exists
      const existing = await db.collection("users").findOne({ clerkUserId });
      if (existing) {
        console.log(`User ${clerkUserId} already exists in MongoDB.`);
        continue;
      }

      const doc = {
        clerkUserId,
        email: email || undefined,
        fullName,
        createdAt,
        preferences: { timezone: null, notifications: true },
      };
      console.log("Inserting doc:", JSON.stringify(doc, null, 2));

      await db.collection("users").insertOne(doc);

      console.log(
        `Synced user ${clerkUserId} (${email || "no email"}) to MongoDB.`
      );
    }

    console.log("Sync complete.");
  } catch (e) {
    console.error("Error:", e.message || e);
  } finally {
    await mongoClient.close();
  }
})();
