import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let _mongoClient: MongoClient | null = null;

async function connectToDatabase(): Promise<MongoClient> {
  if (!uri) throw new Error("MONGODB_URI is not set in environment");
  if (
    _mongoClient &&
    (_mongoClient as any).isConnected &&
    (_mongoClient as any).isConnected()
  ) {
    return _mongoClient;
  }
  _mongoClient = new MongoClient(uri);
  await _mongoClient.connect();
  return _mongoClient;
}

export const nextAuthOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      // When a user signs in, NextAuth will provide `user` — persist its id on the token
      if (user?.id) token.id = user.id;
      return token;
    },
    async session({ session, token }: any) {
      // Expose token.id on the session so client can read `session.user.id`
      if (token?.id) (session.user as any).id = token.id;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await connectToDatabase();
        const db = client.db(process.env.MONGODB_DB || undefined);
        const users = db.collection("users");
        const user = await users.findOne({ email: credentials.email });
        if (!user) return null;

        const storedHash =
          (user as any).password || (user as any).passwordHash || "";
        const valid = await compare(credentials.password, storedHash);
        if (!valid) return null;

        return {
          id: user._id.toString(),
          name: (user as any).name || user.email,
          email: user.email,
        } as any;
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default nextAuthOptions;
