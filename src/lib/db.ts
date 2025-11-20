import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || undefined;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Mongoose connection helper for Next.js projects.
 * Caches the connection in `global` to avoid creating multiple connections in development.
 */
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (global as any)._mongo || { conn: null, promise: null };

if (!cached) (global as any)._mongo = cached = { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: MONGODB_DB,
      // keep other mongoose options default
      // useUnifiedTopology and useNewUrlParser are defaults in modern mongoose
    } as mongoose.ConnectOptions;

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  cached.conn = await cached.promise;
  (global as any)._mongo = cached;
  return cached.conn;
}

export default connectToDatabase;
