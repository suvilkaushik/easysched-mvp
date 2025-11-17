import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import getDb from "@/lib/mongodb";
import ClientPortalClient from "@/components/ClientPortalClient";

export default async function ClientPortalPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const db = await getDb();
  const ownerId = (session as any).user?.id;
  const clientDocs = await db
    .collection("clients")
    .find({ owner: ownerId })
    .toArray();

  const clients = clientDocs.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
  }));

  const initialClientId = clients[0]?.id ?? null;
  return (
    <ClientPortalClient clients={clients} initialClientId={initialClientId} />
  );
}
