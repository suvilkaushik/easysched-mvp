import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clientPromise } from "../../../lib/mongodb";
import { createClientSchema } from "../../../types";

/**
 * GET /api/clients
 * - Returns all clients owned by the logged-in Clerk user
 * POST /api/clients
 * - Creates a new client for the logged-in user (validated with Zod)
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const client = await clientPromise;
  const db = client.db("easysched_dev_suv");

  const clients = await db
    .collection("clients")
    .find({ ownerClerkId: userId })
    .toArray();

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  // Validate input
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const client = await clientPromise;
  const db = client.db("easysched_dev_suv");

  const toInsert = {
    ownerClerkId: userId,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    serviceAddress: parsed.data.serviceAddress || null,
    createdAt: new Date(),
  } as const;

  const result = await db.collection("clients").insertOne(toInsert);

  // Return the inserted client (with insertedId)
  return NextResponse.json({ insertedId: result.insertedId, ...toInsert });
}
