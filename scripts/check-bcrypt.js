require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

(async function () {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const dbName = uri.split("/").pop().split("?")[0] || "easysched_dev_suv";
  const db = client.db(dbName);
  const u = await db
    .collection("users")
    .findOne({ email: "alice@example.com" });
  console.log("found user:", !!u);
  if (!u) {
    await client.close();
    process.exit(1);
  }
  console.log("passwordHash:", u.passwordHash);
  const ok = await bcrypt.compare("TestPass123!", u.passwordHash);
  console.log("bcrypt.compare result:", ok);
  await client.close();
})();
