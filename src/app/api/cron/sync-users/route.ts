import { POST as syncUsers } from "@/app/api/sync-users/route";

export async function GET(req: Request) {
  // Proxy to the sync-users logic so this can be called by Vercel Cron
  return await syncUsers();
}

export async function POST(req: Request) {
  return await syncUsers();
}
