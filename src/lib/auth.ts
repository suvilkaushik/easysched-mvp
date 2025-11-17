import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcrypt";
import argon2 from "argon2";
import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { getDb } from "./mongodb";

async function verifyPassword(stored: unknown, incoming: string) {
  if (!stored || typeof stored !== "string") return false;
  try {
    if (stored.startsWith("$2")) return await bcrypt.compare(incoming, stored);
    if (stored.startsWith("$argon2"))
      return await argon2.verify(stored, incoming);
    return false;
  } catch (err) {
    console.error("Password verify error", err);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const db = await getDb(
          process.env.MONGODB_DB ||
            process.env.NEXT_PUBLIC_MONGODB_DB ||
            "easysched_dev_suv"
        );
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;
        const match = await verifyPassword(
          user.passwordHash,
          credentials.password
        );
        if (!match) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
        } as any;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      (session as any).user.id = (token as any).id;
      return session;
    },
  },
};

export default authOptions;

export async function getServerAuthSession(): Promise<Session | null> {
  try {
    const session = await nextAuthGetServerSession(authOptions as any);
    return session as Session | null;
  } catch (err) {
    return null;
  }
}
