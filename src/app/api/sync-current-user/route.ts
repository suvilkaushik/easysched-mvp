/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
export const dynamic = "force-static";
import { getUserModel } from "@/models/User";

export async function POST(request: Request) {
  // Verify the request is made by an authenticated Clerk session
  // getAuth requires a NextRequest-like object in this runtime
  const auth = getAuth(request as unknown as NextRequest);
  const callerId = auth.userId;
  if (!callerId) return new NextResponse("unauthenticated", { status: 401 });

  try {
    const body = await request.json();
    const clerkId = body?.clerkId;
    if (!clerkId) return new NextResponse("missing clerkId", { status: 400 });

    // Only allow a user to sync their own Clerk record
    if (clerkId !== callerId)
      return new NextResponse("forbidden", { status: 403 });

    const clerkSecret = process.env.CLERK_SECRET_KEY;
    if (!clerkSecret)
      return new NextResponse("missing CLERK_SECRET_KEY", { status: 500 });

    // Fetch user from Clerk admin API
    const res = await fetch(
      `https://api.clerk.com/v1/users/${encodeURIComponent(clerkId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${clerkSecret}` },
      }
    );
    if (!res.ok) {
      const t = await res.text();
      return new NextResponse(
        `failed fetching clerk user: ${res.status} ${t}`,
        { status: 502 }
      );
    }
    const user = await res.json();

    const User = await getUserModel();
    const email = (
      user.email_address ||
      user.email ||
      (user.email_addresses && user.email_addresses[0]?.email_address) ||
      ""
    ).toLowerCase();

    if (!email)
      return new NextResponse("clerk user has no email", { status: 400 });

    const doc = {
      clerkId: user.id,
      username: user.username || undefined,
      email,
      emailAddresses: user.email_addresses || user.emailAddresses || [],
      primaryEmailAddressId:
        user.primary_email_address_id ||
        user.primaryEmailAddressId ||
        undefined,
      firstName: user.first_name || user.firstName || "",
      lastName: user.last_name || user.lastName || "",
      name: user.name || undefined,
      imageUrl: user.image_url || user.profile_image_url || undefined,
      hasImage: !!(user.image_url || user.profile_image_url),
      publicMetadata: user.public_metadata || user.publicMetadata || {},
      privateMetadata: user.private_metadata || user.privateMetadata || {},
      unsafeMetadata: user.unsafe_metadata || user.unsafeMetadata || {},
      externalAccounts: user.external_accounts || user.externalAccounts || [],
      inactive: !!user.banned || !!user.locked,
    } as any;

    await User.findOneAndUpdate({ clerkId: user.id }, doc, {
      upsert: true,
      new: true,
    });

    return NextResponse.json({ ok: true, id: user.id, email });
  } catch (err) {
    console.error("sync-current-user failed", err);
    return new NextResponse("sync failed", { status: 500 });
  }
}

export const GET = () =>
  new NextResponse("method not allowed", { status: 405 });
