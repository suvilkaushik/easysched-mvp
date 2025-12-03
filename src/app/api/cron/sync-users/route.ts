import { POST as syncUsers } from "@/app/api/sync-users/route";

export const dynamic = "force-static";

export async function GET() {
  // Proxy to the sync-users logic so this can be called by Vercel Cron
  return await syncUsers();
}

export async function POST() {
  return await syncUsers();
}
