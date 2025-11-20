import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserModel } from "@/models/User";

async function verifyClerkWebhook(body: string, signature: string | null) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) throw new Error("CLERK_WEBHOOK_SECRET is not configured");
  if (!signature) throw new Error("Missing Clerk signature header");

  try {
    const clerk = await import("@clerk/clerk-sdk-node");
    if (clerk?.Webhook && typeof clerk.Webhook.verify === "function") {
      clerk.Webhook.verify(body, signature, secret);
      return true;
    }
  } catch (err) {
    console.warn(
      "Clerk SDK webhook verify failed:",
      (err as any)?.message || err
    );
  }

  // If SDK verification not available, fail closed.
  throw new Error(
    "Unable to verify webhook: Clerk SDK verification not available"
  );
}

function normalizeEmails(data: any) {
  const emails: Array<any> = [];
  if (Array.isArray(data?.email_addresses)) {
    for (const e of data.email_addresses) {
      emails.push({
        id: e?.id,
        emailAddress: e?.email_address || e?.emailAddress,
        verification: e?.verification,
      });
    }
  } else if (Array.isArray(data?.emailAddresses)) {
    for (const e of data.emailAddresses) {
      emails.push({
        id: e?.id,
        emailAddress: e?.email_address || e?.emailAddress,
        verification: e?.verification,
      });
    }
  } else if (data?.email) {
    emails.push({ emailAddress: data.email });
  } else if (data?.user?.email) {
    emails.push({ emailAddress: data.user.email });
  }
  return emails;
}

function extractUserFromData(data: any) {
  const clerkId = data?.id || data?.user?.id || data?.object?.id || undefined;
  const emails = normalizeEmails(data);
  const primaryEmailAddressId =
    data?.primary_email_address_id || data?.primaryEmailAddressId || undefined;
  const firstName =
    data?.first_name ||
    data?.firstName ||
    data?.user?.first_name ||
    data?.user?.firstName ||
    undefined;
  const lastName =
    data?.last_name ||
    data?.lastName ||
    data?.user?.last_name ||
    data?.user?.lastName ||
    undefined;
  const username =
    data?.username || data?._raw?.username || data?.user?.username || undefined;
  const imageUrl =
    data?.image_url || data?.imageUrl || data?._raw?.image_url || undefined;
  const hasImage = data?.has_image || data?.hasImage || !!imageUrl;
  const publicMetadata =
    data?.public_metadata ||
    data?.publicMetadata ||
    data?._raw?.public_metadata ||
    {};
  const privateMetadata =
    data?.private_metadata ||
    data?.privateMetadata ||
    data?._raw?.private_metadata ||
    {};
  const unsafeMetadata =
    data?.unsafe_metadata ||
    data?.unsafeMetadata ||
    data?._raw?.unsafe_metadata ||
    {};
  const externalAccounts =
    data?.external_accounts ||
    data?.externalAccounts ||
    data?._raw?.external_accounts ||
    [];

  return {
    clerkId,
    emails,
    primaryEmailAddressId,
    firstName,
    lastName,
    username,
    imageUrl,
    hasImage,
    publicMetadata,
    privateMetadata,
    unsafeMetadata,
    externalAccounts,
  } as const;
}

export async function POST(req: NextRequest) {
  const signature =
    req.headers.get("clerk-signature") || req.headers.get("Clerk-Signature");
  const bodyText = await req.text();

  try {
    await verifyClerkWebhook(bodyText, signature);
  } catch (err) {
    console.error("Webhook verification failed:", (err as any)?.message || err);
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(bodyText);
  } catch (err) {
    console.error("Invalid JSON payload");
    return new NextResponse("Invalid payload", { status: 400 });
  }

  const eventType: string =
    payload.type || payload.event || payload.data?.type || "";
  const data =
    payload.data || payload.data?.object || payload?.object || payload;

  try {
    const User = await getUserModel();

    // Extract a normalized user object from the payload
    const u = extractUserFromData(data);
    const clerkId = u.clerkId;

    if (!clerkId) {
      console.warn("Webhook payload missing clerk id; skipping");
      return new NextResponse("no id", { status: 200 });
    }

    const update: any = {
      clerkId,
      username: u.username || undefined,
      email: u.emails?.[0]?.emailAddress
        ? String(u.emails[0].emailAddress).toLowerCase()
        : undefined,
      emailAddresses: u.emails && u.emails.length ? u.emails : undefined,
      primaryEmailAddressId: u.primaryEmailAddressId || undefined,
      firstName: u.firstName || undefined,
      lastName: u.lastName || undefined,
      name: data?.name || undefined,
      imageUrl: u.imageUrl || undefined,
      hasImage: !!u.hasImage,
      publicMetadata: u.publicMetadata || {},
      privateMetadata: u.privateMetadata || {},
      unsafeMetadata: u.unsafeMetadata || {},
      externalAccounts: u.externalAccounts || [],
    };

    if (
      eventType === "user.created" ||
      eventType === "users.create" ||
      eventType === "user:created" ||
      eventType === "user.created.v1"
    ) {
      update.inactive = false;
      await User.findOneAndUpdate({ clerkId }, update, {
        upsert: true,
        new: true,
      });
      return new NextResponse("ok", { status: 200 });
    }

    if (
      eventType === "user.updated" ||
      eventType === "users.update" ||
      eventType === "user:updated" ||
      eventType === "user.updated.v1"
    ) {
      update.inactive = false;
      await User.findOneAndUpdate({ clerkId }, update, {
        upsert: true,
        new: true,
      });
      return new NextResponse("ok", { status: 200 });
    }

    if (
      eventType === "user.deleted" ||
      eventType === "users.delete" ||
      eventType === "user:deleted" ||
      eventType === "user.deleted.v1"
    ) {
      await User.findOneAndUpdate(
        { clerkId },
        { inactive: true },
        { upsert: false, new: true }
      );
      return new NextResponse("ok", { status: 200 });
    }

    // Unknown event: still respond OK so Clerk doesn't retry endlessly
    return new NextResponse("ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error", err);
    return new NextResponse("handler error", { status: 500 });
  }
}
