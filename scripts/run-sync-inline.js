require("dotenv").config({ path: "./.env.local" });

const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
    });
    const UserSchema = new mongoose.Schema(
      {
        clerkId: String,
        email: String,
        firstName: String,
        lastName: String,
        seedPassword: String,
      },
      { timestamps: true }
    );
    const User = mongoose.models.User || mongoose.model("User", UserSchema);
    const users = await User.find({});
    console.log("Found", users.length, "users");
    const sdk = require("@clerk/clerk-sdk-node");
    const client = sdk.createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    for (const u of users) {
      if (!u.clerkId) {
        try {
          const email = (u.email || "").toLowerCase();
          console.log("Processing user", email);
          const foundRes = await client.users.request({
            method: "GET",
            path: "/users",
            queryParams: { email_address: [email], limit: 1 },
          });
          const list = Array.isArray(foundRes)
            ? foundRes
            : foundRes?.data || [];
          let remote = list.length ? list[0] : null;
          if (!remote) {
            const body = {
              email_addresses: [{ email_address: email, verified: true }],
              password:
                u.seedPassword || Math.random().toString(36).slice(-10) + "!A1",
              first_name: u.firstName,
              last_name: u.lastName,
            };
            const createRes = await client.users.request({
              method: "POST",
              path: "/users",
              body,
            });
            remote = createRes;
            console.log("Created remote", remote && remote.id);
          }
          if (remote && remote.id) {
            await User.findOneAndUpdate(
              { _id: u._id },
              { clerkId: remote.id },
              { new: true }
            );
            console.log("Updated mongo user", email, "->", remote.id);
          }
        } catch (e) {
          console.error("Error processing", u.email, e.message || e);
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
