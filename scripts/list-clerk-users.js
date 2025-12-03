require("dotenv").config({ path: "./.env.local" });
const sdk = require("@clerk/clerk-sdk-node");
(async () => {
  const client = sdk.createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  try {
    const res = await client.users.request({
      method: "GET",
      path: "/users",
      queryParams: { limit: 100 },
    });
    const list = Array.isArray(res) ? res : res?.data || [];
    console.log("Clerk users count:", list.length);
    for (const u of list) {
      console.log(
        "id:",
        u.id,
        "email_address:",
        u.email_address ||
          (u.email_addresses && u.email_addresses[0]?.email_address) ||
          u.email ||
          "N/A",
        "username:",
        u.username || "N/A"
      );
    }
  } catch (e) {
    console.error("list error", e && e.message);
    if (e && e.errors) console.error("errors", e.errors);
  }
})();
