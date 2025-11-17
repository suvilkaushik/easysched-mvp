import { NextResponse } from "next/server";
import getDb from "@/lib/mongodb";
import { getServerAuthSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import type { Session } from "next-auth";

async function requireSession(): Promise<Session> {
  const session = await getServerAuthSession();
  if (!session) throw new Error("unauthorized");
  return session;
}

type RouteContext =
  | { params: { id: string } }
  | { params: Promise<{ id: string }> };
export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const userId = (session.user as { id?: string } | undefined)?.id;
    const params =
      context.params instanceof Promise ? await context.params : context.params;
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
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const userId = (session.user as { id?: string } | undefined)?.id;
    const params =
      context.params instanceof Promise ? await context.params : context.params;
    const id = params.id;
    const bodyRaw: unknown = await request.json().catch(() => null);
    if (!id || typeof bodyRaw !== "object" || bodyRaw === null)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    const body = bodyRaw as Record<string, unknown>;
    const db = await getDb();
    const doc = await db
      .collection("clients")
      .findOne({ _id: new ObjectId(id) });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (doc.owner && doc.owner !== userId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const update: Partial<{
      name: string;
      email: string | null;
      phone: string | null;
      updatedAt: Date;
    }> = { updatedAt: new Date() };
    if ("name" in body && typeof body.name === "string")
      update.name = body.name;
    if (
      "email" in body &&
      (typeof body.email === "string" || body.email === null)
    )
      update.email = body.email as string | null;
    if (
      "phone" in body &&
      (typeof body.phone === "string" || body.phone === null)
    )
      update.phone = body.phone as string | null;

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
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await requireSession();
    const userId = (session.user as { id?: string } | undefined)?.id;
    const params =
      context.params instanceof Promise ? await context.params : context.params;
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
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
