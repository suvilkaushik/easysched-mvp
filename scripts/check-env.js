require("dotenv").config({ path: "./.env.local" });
console.log("CLERK_SECRET_KEY present:", !!process.env.CLERK_SECRET_KEY);
console.log(
  "CLERK_SECRET_KEY:",
  process.env.CLERK_SECRET_KEY ? "[REDACTED]" : ""
);
