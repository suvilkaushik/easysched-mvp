require("dotenv").config({ path: "./.env.local" });
const mongoose = require("mongoose");

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB = process.env.MONGODB_DB;
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

  if (!MONGODB_URI || !CLERK_SECRET_KEY) {
    console.error("Missing MONGODB_URI or CLERK_SECRET_KEY in environment");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });

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

  const sdk = require("@clerk/clerk-sdk-node");
  const client = sdk.createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const fetch = require("node-fetch");

  // Debug: list available methods on the SDK client
  try {
    console.log(
      "Clerk SDK client users API keys:",
      Object.keys(client.users || {})
    );
  } catch (e) {
    console.warn("Could not enumerate clerk client methods", e);
  }

  async function fetchCreateClerkUser(body) {
    const url = "https://api.clerk.com/v1/users";
    console.log("Clerk create request body:", JSON.stringify(body));
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = text;
    }
    console.log("Clerk create response status:", res.status, res.statusText);
    console.log("Clerk create response body:", parsed);
    if (!res.ok) {
      const err = new Error("Clerk create failed");
      err.response = parsed;
      err.status = res.status;
      throw err;
    }
    return parsed;
  }

  function generatePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_=+";
    function pick(s) {
      return s[Math.floor(Math.random() * s.length)];
    }
    const parts = [pick(upper), pick(lower), pick(digits), pick(symbols)];
    while (parts.join("").length < 12)
      parts.push(pick(upper + lower + digits + symbols));
    return parts.sort(() => 0.5 - Math.random()).join("");
  }

  function generateUsername(base) {
    const raw = (base || "").toLowerCase().trim();
    const cleaned = raw.replace(/[^a-z0-9_.-]/g, "").slice(0, 48);
    const suffix = Math.random().toString(36).slice(-4);
    let candidate = cleaned || "user" + suffix;
    if (candidate.length < 4) candidate = candidate + suffix;
    if (candidate.length > 64) candidate = candidate.slice(0, 64);
    return candidate;
  }

  // Helper to list clerk users (paginated)
  async function listAllClerkUsers() {
    const out = [];
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
      out.push(...list);
      cursor = list[list.length - 1].id;
      if (list.length < 100) break;
    }
    return out;
  }

  // Step 1: Mongo -> Clerk (create clerk users for mongo entries without clerkId)
  console.log("Starting Mongo -> Clerk sync");
  const mongoUsers = await User.find({});
  for (const u of mongoUsers) {
    try {
      if (!u.clerkId) {
        const email = (u.email || "").toLowerCase();
        const username = generateUsername(u.username || email.split("@")[0]);
        const password = u.seedPassword || generatePassword();

        // check existing clerk user by email
        const foundRes = await client.users.request({
          method: "GET",
          path: "/users",
          queryParams: { email_address: [email], limit: 1 },
        });
        const foundList = Array.isArray(foundRes)
          ? foundRes
          : foundRes?.data || [];
        let remote = foundList.length ? foundList[0] : null;

        if (!remote) {
          const body = {
            username,
            email_address: email,
            password,
            first_name: u.firstName || undefined,
            last_name: u.lastName || undefined,
          };
          try {
            // Use direct REST call to capture full request/response for debugging
            let created = null;
            try {
              created = await fetchCreateClerkUser(body);
            } catch (e) {
              // try alternative payload shapes commonly accepted by Clerk
              const altBodies = [
                Object.assign({}, body, {
                  email_addresses: [
                    { email_address: body.email_address, verified: true },
                  ],
                }),
                {
                  email_addresses: [{ email_address: body.email_address }],
                  username: body.username,
                  password: body.password,
                  first_name: body.first_name,
                  last_name: body.last_name,
                },
                Object.assign(
                  {
                    email_addresses: [
                      { email_address: body.email_address, verified: true },
                    ],
                  },
                  body
                ),
                {
                  email_address: body.email_address,
                  email_addresses: [{ email_address: body.email_address }],
                  username: body.username,
                  password: body.password,
                },
              ];
              for (const alt of altBodies) {
                try {
                  console.log(
                    "Attempting alternative Clerk create payload:",
                    JSON.stringify(alt)
                  );
                  const r = await fetchCreateClerkUser(alt);
                  created = r;
                  break;
                } catch (e2) {
                  console.warn(
                    "Alternative payload failed",
                    e2 && e2.response
                      ? JSON.stringify(e2.response)
                      : e2 && e2.message
                      ? e2.message
                      : e2
                  );
                }
              }
              // Try form-encoded body as a last resort
              if (!created) {
                try {
                  const params = new URLSearchParams();
                  params.append("username", body.username || "");
                  params.append("email_address", body.email_address || "");
                  params.append("password", body.password || "");
                  if (body.first_name)
                    params.append("first_name", body.first_name);
                  if (body.last_name)
                    params.append("last_name", body.last_name);
                  console.log(
                    "Attempting form-encoded Clerk create with params:",
                    params.toString()
                  );
                  const url = "https://api.clerk.com/v1/users";
                  const res = await fetch(url, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: params.toString(),
                  });
                  const text = await res.text();
                  let parsed;
                  try {
                    parsed = JSON.parse(text);
                  } catch (e3) {
                    parsed = text;
                  }
                  console.log(
                    "Form create response status:",
                    res.status,
                    res.statusText
                  );
                  console.log("Form create response body:", parsed);
                  if (res.ok) created = parsed;
                } catch (e3) {
                  console.warn(
                    "Form-encoded create failed",
                    e3 && e3.message ? e3.message : e3
                  );
                }
              }
            }
            remote = created;
            if (remote && remote.id)
              console.log("Created Clerk user for", email, "->", remote.id);
            else
              console.log(
                "Did not create Clerk user for",
                email,
                "- response:",
                remote
              );
          } catch (err) {
            console.warn(
              "Failed creating Clerk user for",
              email,
              (err && err.message) || err,
              err && err.response ? JSON.stringify(err.response) : ""
            );
          }
        } else {
          console.log("Found existing Clerk user for", email, "id=", remote.id);
        }

        if (remote && remote.id) {
          await User.findOneAndUpdate(
            { _id: u._id },
            { clerkId: remote.id },
            { new: true }
          );
          console.log("Updated Mongo user", email, "with clerkId", remote.id);
        }
      }
    } catch (err) {
      console.warn(
        "Error during Mongo->Clerk sync for",
        u.email,
        (err && err.message) || err
      );
    }
  }

  // Step 2: Clerk -> Mongo (create Mongo records for Clerk users that don't exist in Mongo)
  console.log("Starting Clerk -> Mongo sync");
  const clerkUsers = await listAllClerkUsers();
  for (const cu of clerkUsers) {
    try {
      const clerkId = cu.id;
      const email = (
        cu.email_address ||
        cu.email ||
        cu.emailAddress ||
        (cu.emailAddresses && cu.emailAddresses[0]?.emailAddress) ||
        (cu.email_addresses && cu.email_addresses[0]?.email_address) ||
        (cu._raw &&
          cu._raw.email_addresses &&
          cu._raw.email_addresses[0]?.email_address) ||
        ""
      ).toLowerCase();
      if (!email) continue;

      const existing = await User.findOne({ $or: [{ clerkId }, { email }] });
      if (!existing) {
        const newDoc = await User.create({
          clerkId,
          email,
          firstName: cu.first_name || "",
          lastName: cu.last_name || "",
        });
        console.log(
          "Created Mongo user for Clerk user",
          email,
          "->",
          newDoc._id
        );
      } else if (!existing.clerkId) {
        // If existing by email but missing clerkId, update it
        await User.findOneAndUpdate(
          { _id: existing._id },
          { clerkId },
          { new: true }
        );
        console.log("Linked existing Mongo user", email, "to clerkId", clerkId);
      }
    } catch (err) {
      console.warn(
        "Error during Clerk->Mongo sync for",
        cu.id,
        (err && err.message) || err
      );
    }
  }

  // Write out seeded_users.txt with current records for convenience
  const fs = require("fs");
  const mongoUser = await User.findOne({ email: "mongo-user@example.com" });
  const devtest =
    (await User.findOne({ email: "devtest@example.com" })) ||
    (await User.findOne({ email: "clerk-user@example.com" }));
  const lines = [];
  lines.push("Mongo-only user (seeded in Mongo):");
  if (mongoUser) {
    lines.push(`email: ${mongoUser.email}`);
    lines.push(`password: ${mongoUser.seedPassword || "(none)"}`);
    lines.push(`clerkId: ${mongoUser.clerkId || "N/A"}`);
  } else {
    lines.push("Not found in Mongo");
  }
  lines.push("");
  lines.push("Manual Clerk user (devtest):");
  if (devtest) {
    lines.push(`email: ${devtest.email}`);
    lines.push(`username: devtest`);
    lines.push(`password: devtest123`);
    lines.push(`clerkId: ${devtest.clerkId || "N/A"}`);
  } else {
    lines.push("Not found in Mongo");
  }
  fs.writeFileSync("seeded_users.txt", lines.join("\n"));
  console.log("Wrote seeded_users.txt");

  console.log("Two-way sync complete");
  process.exit(0);
}

main().catch((err) => {
  console.error("Two-way sync failed", err);
  process.exit(1);
});
