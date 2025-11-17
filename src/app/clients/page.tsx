import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import getDb from "@/lib/mongodb";
import ClientsPageClient from "@/components/ClientsPageClient";

type ClientDoc = {
  _id: { toString(): string };
  name?: string;
  email?: string | null;
  phone?: string | null;
  createdAt?: string | Date | null;
};

export default async function ClientsPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const db = await getDb();
  // query clients by owner (normalized field)
  const ownerId = (session.user as { id?: string } | undefined)?.id;
  const clientDocs = (await db
    .collection("clients")
    .find({ owner: ownerId })
    .toArray()) as ClientDoc[];

  const clients = clientDocs.map((c) => ({
    id: c._id.toString(),
    name: c.name || "",
    email: c.email || "",
    phone: c.phone || "",
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
  }));

  return <ClientsPageClient initialClients={clients} />;
}
