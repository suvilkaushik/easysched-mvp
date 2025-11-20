// Full replacement: clean sync endpoint implementation
import { NextResponse } from "next/server";
import { getUserModel } from "@/models/User";
import { createClerkClient } from "@clerk/clerk-sdk-node";

export const dynamic = "force-dynamic";

function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+";
  function pick(s: string) {
    return s[Math.floor(Math.random() * s.length)];
  }
  const parts = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  while (parts.join("").length < 12) {
    const pool = upper + lower + digits + symbols;
    parts.push(pick(pool));
  }
  return parts.sort(() => 0.5 - Math.random()).join("");
}

function generateUsername(base?: string) {
  const raw = (base || "").toLowerCase().trim();
  const cleaned = raw.replace(/[^a-z0-9_.-]/g, "").slice(0, 48);
  const suffix = Math.random().toString(36).slice(-4);
  let candidate = cleaned || "user" + suffix;
  if (candidate.length < 4) candidate = candidate + suffix;
  if (candidate.length > 64) candidate = candidate.slice(0, 64);
  return candidate;
}

export async function POST() {
  try {
    const User = await getUserModel();
    const users = await User.find({});

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret) {
      console.error("CLERK_SECRET_KEY not configured");
      return new NextResponse("missing clerk secret", { status: 500 });
    }

    const clerkSdk = await import("@clerk/clerk-sdk-node");
    const client: any = (clerkSdk as any).createClerkClient({
      secretKey: clerkSecret,
    });

    for (const u of users) {
      const mongoUser: any = u;
      try {
        if (!mongoUser.clerkId) {
          const email = (mongoUser.email || "").toLowerCase();

          // try find by email first
          let found: any = null;
          try {
            const res = await client.users.request({
              method: "GET",
              path: "/users",
              queryParams: { email_address: [email], limit: 1 },
            });
            const list = Array.isArray(res) ? res : res?.data || [];
            if (Array.isArray(list) && list.length > 0) found = list[0];
          } catch (err) {
            console.warn("Clerk list users failed", err);
          }

          if (!found) {
            const username = generateUsername(
              mongoUser.username || mongoUser.email?.split("@")[0]
            );
            const password = mongoUser.seedPassword || generatePassword();

            const body: any = {
              username,
              email_address: email,
              password,
              first_name: mongoUser.firstName || undefined,
              last_name: mongoUser.lastName || undefined,
              public_metadata: { synced_from: "mongo" },
            };

            try {
              // Use form-encoded POST for this Clerk project (it accepts form data)
              const params = new URLSearchParams();
              if (body.username) params.append("username", body.username);
              if (body.email_address)
                params.append("email_address", body.email_address);
              if (body.password) params.append("password", body.password);
              if (body.first_name) params.append("first_name", body.first_name);
              if (body.last_name) params.append("last_name", body.last_name);

              const res = await fetch("https://api.clerk.com/v1/users", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${clerkSecret}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
              });
              const created = await res.json();
              if (!res.ok) {
                console.error("Clerk create user failed for", email, created);
              } else {
                found = created;
                console.log("Created Clerk user", email, "id=", created?.id);
              }
            } catch (err: any) {
              console.error("Clerk create user failed for", email, err);
            }
          }

          if (found && found.id) {
            await User.findOneAndUpdate(
              { _id: mongoUser._id },
              { clerkId: found.id },
              { new: true }
            );
          }
        } else {
          // remote update: ensure profile fields are synced
          const clerkId = mongoUser.clerkId;
          try {
            const remote = await client.users.request({
              method: "GET",
              path: `/users/${clerkId}`,
            });
            if (remote) {
              const remoteEmail = (
                remote.email_address ||
                remote.email ||
                (remote.email_addresses &&
                  remote.email_addresses[0]?.email_address) ||
                ""
              ).toLowerCase();
              const needUpdate: any = {};
              if (remoteEmail !== (mongoUser.email || "").toLowerCase()) {
                needUpdate.email_addresses = [
                  {
                    email_address: (mongoUser.email || "").toLowerCase(),
                    verified: true,
                  },
                ];
              }
              if ((remote.first_name || "") !== (mongoUser.firstName || ""))
                needUpdate.first_name = mongoUser.firstName || "";
              if ((remote.last_name || "") !== (mongoUser.lastName || ""))
                needUpdate.last_name = mongoUser.lastName || "";

              if (Object.keys(needUpdate).length > 0) {
                try {
                  await client.users.request({
                    method: "PATCH",
                    path: `/users/${clerkId}`,
                    body: needUpdate,
                  });
                } catch (err) {
                  console.warn("Failed updating Clerk user", clerkId, err);
                }
              }
            }
          } catch (err) {
            console.warn("Failed fetching Clerk user", mongoUser.clerkId, err);
          }
        }
      } catch (err) {
        console.warn("Error syncing Mongo->Clerk for user", mongoUser._id, err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sync users failed", err);
    return new NextResponse("sync failed", { status: 500 });
  }
}

export const GET = POST;
