require("dotenv").config({ path: "./.env.local" });
const sdk = require("@clerk/clerk-sdk-node");
(async () => {
  const client = sdk.createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  try {
    const body = {
      email_address: "test-create@example.com",
      password: "TestPass123!",
      first_name: "Test",
      last_name: "Create",
    };
    const res = await client.users.request({
      method: "POST",
      path: "/users",
      body,
    });
    console.log("create res", res);
  } catch (e) {
    console.error("create error", e && e.message);
    if (e && e.errors) console.error("errors", e.errors);
    if (e && e.raw) console.error("raw", e.raw);
    if (e && e.response) console.error("response", e.response);
  }
})();
