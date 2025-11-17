require("dotenv").config({ path: ".env.local" });
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const fs = require("fs");

async function seed() {
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

    const users = [
      {
        name: "Alice Admin",
        email: "alice@example.com",
        password: "TestPass123!",
      },
      {
        name: "Bob Builder",
        email: "bob@example.com",
        password: "Password!234",
      },
    ];

    const credentialsOutput = [];

    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const res = await db.collection("users").findOneAndUpdate(
        { email: u.email },
        {
          $set: {
            name: u.name,
            email: u.email,
            passwordHash,
            createdAt: new Date(),
            updatedAt: new Date(),
            emailVerified: new Date(),
            isDisabled: false,
            role: "user",
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      const userId = res.value._id;
      // create a sample client for each user
      const clientDoc = {
        userId: userId,
        name: `${u.name.split(" ")[0]}'s Client`,
        email: `${u.email.split("@")[0]}.client@example.com`,
        phone: "(555) 000-0000",
        createdAt: new Date(),
      };
      await db.collection("clients").insertOne(clientDoc);

      credentialsOutput.push({ email: u.email, password: u.password });
    }

    const outPath = "./scripts/sample-credentials.txt";
    const out = credentialsOutput
      .map((c) => `email: ${c.email}  password: ${c.password}`)
      .join("\n");
    fs.writeFileSync(outPath, out);
    console.log("Seed complete. Credentials written to", outPath);
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    await client.close();
  }
}

seed();
