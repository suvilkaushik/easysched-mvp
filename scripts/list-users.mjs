import fs from 'fs';
import { MongoClient } from 'mongodb';

// This script expects environment variables to be available in process.env.
// When running locally we source `.env.local` in the shell before invoking node:
//    set -a; source .env.local; set +a; node scripts/list-users.mjs

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'easysched-dev-suv';

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = await db.collection('users').find({}).toArray();
    console.log(`Connected to ${uri} / db=${dbName}`);
    console.log(`Found ${users.length} users (showing up to 10):`);
    users.slice(0, 10).forEach((u, i) => {
      console.log(`${i + 1}. ${u.email || '<no-email>'} (id: ${u._id})`);
    });

    // write backup file
    const outPath = 'scripts/users-backup.json';
    fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
    console.log(`Wrote backup to ${outPath}`);
  } catch (err) {
    console.error('Error connecting or listing users:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
