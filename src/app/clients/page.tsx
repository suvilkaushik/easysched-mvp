import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import getDb from "@/lib/mongodb";
import ClientsPageClient from "@/components/ClientsPageClient";

export default async function ClientsPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/api/auth/signin");
  }

  const db = await getDb();
  // support both `owner` (string) and `userId` fields
  const userId = (session as any).user?.id;
  const clientDocs = await db
    .collection("clients")
    .find({ $or: [{ owner: userId }, { userId: userId }] })
    .toArray();

  const clients = clientDocs.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
  }));

  return <ClientsPageClient initialClients={clients} />;
}
