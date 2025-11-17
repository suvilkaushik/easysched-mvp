import { NextResponse } from "next/server";
import getDb from "@/lib/mongodb";
import { getServerAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

async function requireSession() {
  const session = await getServerAuthSession();
  if (!session) throw new Error("unauthorized");
  return session;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession();
    const userId = (session as any).user?.id;
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    const doc = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.owner && doc.owner !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const client = {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email || null,
      phone: doc.phone || null,
      owner: doc.owner || null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
    };
    return NextResponse.json({ client });
  } catch (err: any) {
    if (err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    const userId = (session as any).user?.id;
    const id = params.id;
    const body = await request.json().catch(() => null);
    if (!id || !body)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const db = await getDb();
    const doc = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.owner && doc.owner !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const update: any = { updatedAt: new Date() };
    if (body.name !== undefined) update.name = body.name;
    if (body.email !== undefined) update.email = body.email;
    if (body.phone !== undefined) update.phone = body.phone;

    await db
      .collection("clients")
      .updateOne({ _id: new ObjectId(id) }, { $set: update });
    const updated = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(id) });
    let client = null;
    if (updated) {
      client = {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email || null,
        phone: updated.phone || null,
        owner: updated.owner || null,
        createdAt: updated.createdAt || null,
        updatedAt: updated.updatedAt || null,
      };
    }
    return NextResponse.json({ client });
  } catch (err: any) {
    if (err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    const userId = (session as any).user?.id;
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const db = await getDb();
    const doc = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.owner && doc.owner !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.collection("clients").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
