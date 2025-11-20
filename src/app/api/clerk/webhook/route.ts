import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUserModel } from "@/models/User";

async function verifyClerkWebhook(body: string, signature: string | null) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not configured");
  }

  if (!signature) {
    throw new Error("Missing Clerk signature header");
  }

  try {
    // Use Clerk SDK verification if available. This may throw if invalid.
    const clerk = await import("@clerk/clerk-sdk-node");
    if (
      (clerk as any).Webhook &&
      typeof (clerk as any).Webhook.verify === "function"
    ) {
      (clerk as any).Webhook.verify(body, signature, secret);
      return true;
    }
  } catch (err) {
    // fallthrough to manual check or error
    console.warn(
      "Clerk SDK webhook verify failed:",
      (err as any)?.message || err
    );
  }

  // If Clerk SDK not available or verification method not found, throw.
  throw new Error(
    "Unable to verify webhook: Clerk SDK verification not available"
  );
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

    if (
      eventType === "user.created" ||
      eventType === "users.create" ||
      eventType === "user:created"
    ) {
      const clerkId = data?.id || data?.user?.id;
      const email =
        data?.emailAddresses?.[0]?.emailAddress ||
        data?.email ||
        data?.primary_email_address?.email_address ||
        data?.email_address;
      const firstName =
        data?.firstName ||
        data?.first_name ||
          if (eventType === 'user.created' || eventType === 'users.create' || eventType === 'user:created' || eventType === 'user.created.v1') {
            const clerkId = data?.id || data?.user?.id || data?.object?.id;
            const username = data?.username || data?._raw?.username || data?.user?.username;
            const emailAddresses = data?.email_addresses || data?.emailAddresses || data?.email_addresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.email_addresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.email_addresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.email_addresses || data?.emailAddresses || data?.emailAddresses || data?.email_addresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddresses || data?.emailAddress || data?.emailAddresses || data?.email || data?.user?.email || data?.user?.email_address || data?.email_address;
            // extract email list robustly
            let emails = [];
            if (Array.isArray(data?.email_addresses)) emails = data.email_addresses.map((e: any) => ({ id: e.id, emailAddress: e.email_address || e.emailAddress, verification: e.verification }));
            else if (Array.isArray(data?.emailAddresses)) emails = data.emailAddresses.map((e: any) => ({ id: e.id, emailAddress: e.email_address || e.emailAddress, verification: e.verification }));
            else if (data?.email) emails = [{ emailAddress: data.email }];
            const primaryEmailAddressId = data?.primary_email_address_id || data?.primaryEmailAddressId || data?.primaryEmailAddressId || data?.primary_email_address_id;
            const firstName = data?.first_name || data?.firstName || data?.user?.first_name || data?.user?.firstName || null;
            const lastName = data?.last_name || data?.lastName || data?.user?.last_name || data?.user?.lastName || null;
            const imageUrl = data?.image_url || data?.imageUrl || data?._raw?.image_url || null;
            const hasImage = data?.has_image || data?.hasImage || !!imageUrl;
            const publicMetadata = data?.public_metadata || data?.publicMetadata || data?._raw?.public_metadata || {};
            const privateMetadata = data?.private_metadata || data?.privateMetadata || data?._raw?.private_metadata || {};
            const unsafeMetadata = data?.unsafe_metadata || data?.unsafeMetadata || data?._raw?.unsafe_metadata || {};
            const externalAccounts = data?.external_accounts || data?.externalAccounts || data?._raw?.external_accounts || [];

            if (!clerkId) {
              console.warn('Webhook user.created missing id - skipping');
            } else {
              const update = {
                clerkId,
                username: username || undefined,
                email: emails[0]?.emailAddress?.toLowerCase() || undefined,
                emailAddresses: emails,
                primaryEmailAddressId: primaryEmailAddressId || undefined,
                firstName,
                lastName,
                name: data?.name || null,
                imageUrl,
                hasImage,
                publicMetadata,
                privateMetadata,
                unsafeMetadata,
                externalAccounts,
                inactive: false,
              } as any;

              await User.findOneAndUpdate({ clerkId }, update, { upsert: true, new: true });
            }
          }

          if (eventType === 'user.updated' || eventType === 'users.update' || eventType === 'user:updated' || eventType === 'user.updated.v1') {
            const clerkId = data?.id || data?.user?.id || data?.object?.id;
            if (!clerkId) {
              console.warn('Webhook user.updated missing clerkId - skipping');
            } else {
              const username = data?.username || data?._raw?.username || data?.user?.username;
              const firstName = data?.first_name || data?.firstName || data?.user?.first_name || data?.user?.firstName || null;
              const lastName = data?.last_name || data?.lastName || data?.user?.last_name || data?.user?.lastName || null;
              const imageUrl = data?.image_url || data?.imageUrl || data?._raw?.image_url || null;
              const hasImage = data?.has_image || data?.hasImage || !!imageUrl;
              let emails = [];
              if (Array.isArray(data?.email_addresses)) emails = data.email_addresses.map((e: any) => ({ id: e.id, emailAddress: e.email_address || e.emailAddress, verification: e.verification }));
              else if (Array.isArray(data?.emailAddresses)) emails = data.emailAddresses.map((e: any) => ({ id: e.id, emailAddress: e.email_address || e.emailAddress, verification: e.verification }));
              const primaryEmailAddressId = data?.primary_email_address_id || data?.primaryEmailAddressId || undefined;
              const publicMetadata = data?.public_metadata || data?.publicMetadata || data?._raw?.public_metadata || {};
              const privateMetadata = data?.private_metadata || data?.privateMetadata || data?._raw?.private_metadata || {};
              const unsafeMetadata = data?.unsafe_metadata || data?.unsafeMetadata || {};
              const externalAccounts = data?.external_accounts || data?.externalAccounts || data?._raw?.external_accounts || [];

              const update: any = {
                username: username || undefined,
                firstName,
                lastName,
                imageUrl,
                hasImage,
                emailAddresses: emails.length ? emails : undefined,
                primaryEmailAddressId: primaryEmailAddressId || undefined,
                publicMetadata,
                privateMetadata,
                unsafeMetadata,
                externalAccounts,
                inactive: false,
              };

              // If emails present, update main email too
              if (emails.length && emails[0].emailAddress) update.email = emails[0].emailAddress.toLowerCase();

              await User.findOneAndUpdate({ clerkId }, update, { upsert: true, new: true });
            }
          }

          if (eventType === 'user.deleted' || eventType === 'users.delete' || eventType === 'user:deleted' || eventType === 'user.deleted.v1') {
            const clerkId = data?.id || data?.user?.id || data?.object?.id;
            if (!clerkId) {
              console.warn('Webhook user.deleted missing clerkId - skipping');
            } else {
              await User.findOneAndUpdate({ clerkId }, { inactive: true }, { upsert: false, new: true });
            }
          }
        update.inactive = false;

        await User.findOneAndUpdate({ clerkId }, update, {
          upsert: true,
          new: true,
        });
      }
    }

    if (
      eventType === "user.deleted" ||
      eventType === "users.delete" ||
      eventType === "user:deleted"
    ) {
      const clerkId = data?.id || data?.user?.id;
      if (!clerkId) {
        console.warn("Webhook user.deleted missing clerkId - skipping");
      } else {
        await User.findOneAndUpdate(
          { clerkId },
          { inactive: true },
          { upsert: false, new: true }
        );
      }
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err) {
    console.error("Webhook handler error", err);
    return new NextResponse("handler error", { status: 500 });
  }
}
