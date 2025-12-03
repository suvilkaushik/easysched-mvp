/*
  Clerk webhook handler (svix verification)
  - Verifies webhook using `svix`
  - Listens for `user.created` events and upserts into the `users` collection
  - Stores: clerkUserId, email, fullName, createdAt, preferences
*/
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { clientPromise } from "../../../../lib/mongodb";

export async function POST(req: NextRequest) {
  const signature =
    req.headers.get("svix-signature") ||
    req.headers.get("Svix-Signature") ||
    req.headers.get("clerk-signature") ||
    req.headers.get("Clerk-Signature");
  const bodyText = await req.text();

  const secret = process.env.SVIX_SECRET || process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing SVIX_SECRET or CLERK_WEBHOOK_SECRET");
    return new NextResponse("server misconfigured", { status: 500 });
  }

  try {
    const wh = new Webhook(secret);
    // svix's verify throws if invalid
    const headers = {
      "svix-signature": signature || "",
    };
    const evt = wh.verify(bodyText, headers) as Record<string, unknown>;

    const type = (evt.type || evt.event || "").toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (evt.data || evt.payload || evt) as Record<string, any>;

    if (!type) {
      return new NextResponse("no event type", { status: 200 });
    }

    // Only handle user.created events here
    if (type === "user.created" || type === "user:created") {
      const clerkUserId = data?.id || data?.user?.id || data?.object?.id;
      const email =
        data?.email ||
        data?.email_address ||
        data?.primary_email_address ||
        data?.emailAddresses?.[0]?.email ||
        data?.user?.email;
      const fullName =
        data?.name ||
        `${data?.first_name || data?.user?.first_name || ""} ${
          data?.last_name || data?.user?.last_name || ""
        }`.trim() ||
        data?.fullName ||
        data?.user?.fullName ||
        undefined;
      const createdAtRaw =
        data?.created_at ||
        data?.createdAt ||
        data?.user?.created_at ||
        data?.user?.createdAt;
      const createdAt = createdAtRaw ? new Date(createdAtRaw) : new Date();

      if (!clerkUserId) {
        console.warn("user.created missing clerk id; skipping");
        return new NextResponse("ignored", { status: 200 });
      }

      const client = await clientPromise;
      const db = client.db("easysched_dev_suv");

      await db.collection("users").updateOne(
        { clerkUserId: String(clerkUserId) },
        {
          $set: {
            email: email ? String(email).toLowerCase() : undefined,
            fullName: fullName || undefined,
            createdAt,
          },
          $setOnInsert: {
            preferences: { timezone: null, notifications: true },
          },
        },
        { upsert: true }
      );

      return NextResponse.json({ ok: true });
    }

    // For all other events respond OK so Svix/Clerk does not retry repeatedly
    return NextResponse.json({ ignored: true });
  } catch (err) {
    console.error(
      "Webhook verification/handler error:",
      (err as Error)?.message || err
    );
    return new NextResponse("invalid signature or payload", { status: 401 });
  }
}
