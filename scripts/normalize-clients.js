#!/usr/bin/env node
require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Please set MONGODB_URI in .env.local");
    process.exit(1);
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  try {
    const dbName =
      process.env.MONGODB_DB ||
      (uri && uri.split("/").pop().split("?")[0]) ||
      "easysched_dev_suv";
    const db = client.db(dbName);
    const clients = db.collection("clients");
    const users = db.collection("users");

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `clients_backup_${ts}`;
    console.log("Creating backup collection:", backupName);
    const all = await clients.find({}).toArray();
    if (all.length === 0) {
      console.log("No clients to process.");
      return;
    }
    await db.collection(backupName).insertMany(all);
    console.log("Backup created with", all.length, "documents");

    let updated = 0;
    let removedUserId = 0;
    let problems = [];

    // Build a set of user IDs for quick validation
    const userDocs = await users.find({}).project({ _id: 1 }).toArray();
    const userIdSet = new Set(userDocs.map((u) => u._id.toString()));

    for (const doc of all) {
      const id = doc._id;
      let owner = null;
      if (doc.owner !== undefined && doc.owner !== null && doc.owner !== "") {
        owner =
          typeof doc.owner === "object" && doc.owner.toString
            ? doc.owner.toString()
            : String(doc.owner);
      }
      let userId = null;
      if (
        doc.userId !== undefined &&
        doc.userId !== null &&
        doc.userId !== ""
      ) {
        userId =
          typeof doc.userId === "object" && doc.userId.toString
            ? doc.userId.toString()
            : String(doc.userId);
      }

      let update = {};
      let doUpdate = false;

      if (owner && userId) {
        // both present
        if (owner === userId) {
          // duplicate, remove userId
          update.$unset = { userId: "" };
          doUpdate = true;
          removedUserId++;
        } else {
          // conflict: prefer `owner`, remove `userId`
          update.$unset = { userId: "" };
          doUpdate = true;
          removedUserId++;
          problems.push({
            id: id.toString(),
            issue: "owner_userId_conflict",
            owner,
            userId,
          });
        }
      } else if (!owner && userId) {
        // only userId present: promote to owner
        update.$set = { owner: userId };
        update.$unset = { userId: "" };
        doUpdate = true;
        removedUserId++;
      } else if (owner && !userId) {
        // only owner exists: ensure string form
        if (typeof doc.owner === "object") {
          update.$set = { owner: owner };
          doUpdate = true;
        }
      } else {
        // neither present
        problems.push({ id: id.toString(), issue: "no_owner_or_userId" });
      }

      if (doUpdate) {
        await clients.updateOne({ _id: id }, update);
        updated++;
      }

      // Validate owner existence
      const finalOwner = (update.$set && update.$set.owner) || owner;
      if (finalOwner) {
        if (!userIdSet.has(finalOwner)) {
          problems.push({
            id: id.toString(),
            issue: "owner_not_found",
            owner: finalOwner,
          });
        }
      }
    }

    console.log("Normalization complete. Updated:", updated);
    console.log("Removed/converted userId fields:", removedUserId);
    if (problems.length) {
      console.log("Problems detected:", problems.length);
      for (const p of problems) console.log(JSON.stringify(p));
    } else {
      console.log("No problems detected.");
    }
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
