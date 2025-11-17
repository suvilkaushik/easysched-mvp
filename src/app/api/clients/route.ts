import { NextResponse } from "next/server";
import getDb from "@/lib/mongodb";
import { getServerAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session as any).user?.id;
  const db = await getDb();
  const docs = await db.collection("clients").find({ owner: userId }).toArray();

  const clients = docs.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    owner: c.owner || null,
    createdAt: c.createdAt || null,
  }));

  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || !body.name)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const userId = (session as any).user?.id;
  const db = await getDb();
  const now = new Date();
  const res = await db.collection("clients").insertOne({
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    owner: userId,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db
    .collection("clients")
    .findOne({ _id: res.insertedId });
  if (!created)
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  const client = {
    id: created._id.toString(),
    name: created.name,
    email: created.email || null,
    phone: created.phone || null,
    owner: created.owner || null,
    createdAt: created.createdAt || null,
    updatedAt: created.updatedAt || null,
  };

  return NextResponse.json({ client }, { status: 201 });
}
