import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clientPromise } from "../../../lib/mongodb";

/**
 * GET /api/user
 * - Uses Clerk server auth to identify the current user
 * - Returns the user's profile document from the `users` collection
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db("easysched_dev_suv");

  const user = await db.collection("users").findOne({ clerkUserId: userId });
  if (!user) return new NextResponse("Not found", { status: 404 });

  return NextResponse.json(user);
}
