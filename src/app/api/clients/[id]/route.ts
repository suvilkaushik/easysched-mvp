import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clientPromise } from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * DELETE /api/clients/[id]
 * - Deletes a client by ID, ensuring it belongs to the logged-in user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  if (!id || !ObjectId.isValid(id)) {
    return new NextResponse("Invalid client ID", { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db("easysched_dev_suv");

  const result = await db.collection("clients").deleteOne({
    _id: new ObjectId(id),
    ownerClerkId: userId,
  });

  if (result.deletedCount === 0) {
    return new NextResponse("Client not found or not authorized", {
      status: 404,
    });
  }

  return new NextResponse(null, { status: 204 });
}

export async function generateStaticParams() {
  return [];
}
