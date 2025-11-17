import { NextResponse } from "next/server";
import getDb from "@/lib/mongodb";
import { getServerAuthSession } from "@/lib/auth";
import type { Session } from "next-auth";

type ClientDoc = {
  _id: { toString(): string };
  name?: string;
  email?: string | null;
  phone?: string | null;
  owner?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export async function GET() {
  const session = await getServerAuthSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string } | undefined)?.id;
  const db = await getDb();
  const docs = (await db
    .collection("clients")
    .find({ owner: userId })
    .toArray()) as ClientDoc[];

  const clients = docs.map((c) => ({
    id: c._id.toString(),
    name: c.name || "",
    email: c.email || null,
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

  const bodyRaw: unknown = await request.json().catch(() => null);
  if (typeof bodyRaw !== "object" || bodyRaw === null)
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const body = bodyRaw as Record<string, unknown>;
  if (!body.name || typeof body.name !== "string")
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const userId = (session.user as { id?: string } | undefined)?.id;
  const db = await getDb();
  const now = new Date();
  const res = await db.collection("clients").insertOne({
    name: body.name,
    email: typeof body.email === "string" ? body.email : null,
    phone: typeof body.phone === "string" ? body.phone : null,
    owner: userId,
    createdAt: now,
    updatedAt: now,
  });

  const created = (await db
    .collection("clients")
    .findOne({ _id: res.insertedId })) as ClientDoc | null;
  if (!created)
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });

  const client = {
    id: created._id.toString(),
    name: created.name || "",
    email: created.email || null,
    phone: created.phone || null,
    owner: created.owner || null,
    createdAt: created.createdAt || null,
    updatedAt: created.updatedAt || null,
  };

  return NextResponse.json({ client }, { status: 201 });
}
