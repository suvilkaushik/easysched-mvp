#!/usr/bin/env node
require("dotenv").config({ path: "./.env.local" });

const mongoose = require("mongoose");
const fs = require("fs");
const fetch = require("node-fetch");

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

  if (!MONGODB_URI || !CLERK_SECRET_KEY) {
    console.error("Missing MONGODB_URI or CLERK_SECRET_KEY in environment");
    process.exit(1);
  }

  // connect mongoose
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });

  // define User model similar to src/models/User.ts
  const UserSchema = new mongoose.Schema(
    {
      clerkId: { type: String, index: true, unique: true, sparse: true },
      email: { type: String, required: true, index: true, unique: true },
      firstName: String,
      lastName: String,
      inactive: { type: Boolean, default: false },
      seedPassword: String,
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", UserSchema);

  // Clear Mongo users
  console.log("Clearing users collection in MongoDB...");
  await User.deleteMany({});

  // Initialize Clerk SDK
  const clerkSdk = require("@clerk/clerk-sdk-node");
  const clerkClient = clerkSdk.users || clerkSdk;

  // Delete all Clerk users (be careful!)
    const clerkClient = clerkSdk.createClerkClient({ apiKey: CLERK_SECRET_KEY });
  try {
    if (typeof clerkClient.getUserList === "function") {
      const list = await clerkClient.getUserList({ limit: 100 });
      for (const u of list) {
      const listRes = await clerkClient.users.request({ method: 'GET', path: '/v1/users', queryParams: { limit: 100 } });
      const list = Array.isArray(listRes) ? listRes : listRes?.data || [];
            await clerkClient.deleteUser(u.id);
            console.log("Deleted Clerk user", u.id);
          await clerkClient.users.request({ method: 'DELETE', path: `/v1/users/${u.id}` });
          console.warn("Failed deleting user", u.id, err.message || err);
        }
      }
    }
  } catch (err) {
    console.warn("Could not list Clerk users:", err.message || err);
  }

  // Create a Mongo-only user (with seedPassword)
  const mongoEmail = "mongo-user@example.com";
  const mongoPassword = "MongoPass123!";
  const mongoUser = await User.create({
    email: mongoEmail,
    firstName: "Mongo",
    lastName: "User",
    seedPassword: mongoPassword,
  });
  console.log("Created mongo-only user:", mongoEmail);

  // Create a Clerk-only user
  const clerkEmail = "clerk-user@example.com";
  const clerkPassword = "ClerkPass123!";
  let clerkCreated = null;
  try {
    if (typeof clerkClient.createUser === "function") {
      // Create Clerk user via REST proxy
      const body = {
        email_addresses: [{ email_address: clerkEmail, verified: true }],
        password: clerkPassword,
        first_name: 'Clerk',
        last_name: 'Only',
      };
      const createRes = await clerkClient.users.request({ method: 'POST', path: '/v1/users', body });
      clerkCreated = createRes;
      console.log('Created clerk-only user:', clerkEmail, clerkCreated?.id || '(no id)');
    console.error("Failed creating clerk user:", err.message || err);
  }

  // Call the local sync endpoint to create a Clerk user for mongo-only
  console.log("Calling local sync endpoint...");
  try {
    const res = await fetch("http://localhost:3000/api/sync-users", {
      method: "POST",
    });
    console.log("Sync endpoint response:", res.status);
  } catch (err) {
    console.warn("Failed to call sync endpoint:", err.message || err);
  }

  // Wait a moment
  await new Promise((r) => setTimeout(r, 1500));

  // Refresh Mongo user from DB
  const refreshedMongoUser = await User.findOne({ email: mongoEmail });
  const clerkIdForMongo = refreshedMongoUser?.clerkId || null;

  // For the clerk-created user, create a Mongo entry to simulate webhook
  let createdMongoForClerk = null;
  if (clerkCreated && clerkCreated.id) {
    createdMongoForClerk = await User.create({
      email: clerkEmail,
      firstName: "Clerk",
      lastName: "Only",
      clerkId: clerkCreated.id,
    });
    console.log(
      "Created Mongo record for clerk-only user to simulate webhook."
    );
  }

  // Write seeded credentials to a file
  const out = [];
  out.push("Mongo-only user (seeded in Mongo, synced to Clerk):");
  out.push(`email: ${mongoEmail}`);
  out.push(`password: ${mongoPassword}`);
  out.push(`clerkId (after sync): ${clerkIdForMongo || "N/A"}`);
  out.push("");
  out.push("Clerk-only user (created in Clerk):");
  out.push(`email: ${clerkEmail}`);
  out.push(`password: ${clerkPassword}`);
  out.push(`clerkId: ${clerkCreated ? clerkCreated.id : "N/A"}`);

  fs.writeFileSync("seeded_users.txt", out.join("\n"));
  console.log("Wrote seeded_users.txt with credentials.");

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed script failed", err);
  process.exit(1);
});
