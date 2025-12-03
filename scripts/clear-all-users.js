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
    // Connect to MongoDB
    await mongoClient.connect();
    const db = mongoClient.db("easysched_dev_suv");

    // Clear MongoDB users
    console.log("Clearing all users from MongoDB...");
    const mongoResult = await db.collection("users").deleteMany({});
    console.log(`Deleted ${mongoResult.deletedCount} users from MongoDB.`);

    // Clear Clerk users
    console.log("Fetching all Clerk users...");
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

    console.log(`Found ${clerkUsers.length} Clerk users to delete.`);
    for (const u of clerkUsers) {
      try {
        await client.users.request({
          method: "DELETE",
          path: `/users/${u.id}`,
        });
        console.log(
          `Deleted Clerk user: ${u.id} (${
            u.username || u.email_address || "N/A"
          })`
        );
      } catch (err) {
        console.error(
          `Failed to delete Clerk user ${u.id}:`,
          err.message || err
        );
      }
    }

    console.log("All users cleared from MongoDB and Clerk.");
  } catch (e) {
    console.error("Error:", e.message || e);
  } finally {
    await mongoClient.close();
  }
})();
