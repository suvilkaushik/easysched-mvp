import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcrypt";
import argon2 from "argon2";
import type { NextAuthOptions, Session } from "next-auth";
import type { User as AppUser } from "@/types";
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
        // Return a minimal user object matching our `User` interface
        const returnedUser: AppUser = {
          id: user._id.toString(),
          email: user.email,
          name: user.name || user.email,
          role: (user.role as AppUser["role"]) || "client",
        };
        return returnedUser;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      const maybeId = (user as unknown as { id?: string })?.id;
      if (typeof maybeId === "string") {
        (token as unknown as Record<string, unknown>).id = maybeId;
      }
      return token;
    },
    async session({ session, token }) {
      const maybeId = (token as unknown as Record<string, unknown>).id as
        | string
        | undefined;
      if (session.user && maybeId) {
        (session.user as unknown as { id?: string }).id = maybeId;
      }
      return session;
    },
  },
};

export default authOptions;

export async function getServerAuthSession(): Promise<Session | null> {
  try {
    // nextAuthGetServerSession accepts (req?, res?, options?) but in this app we only pass options
    const session = await nextAuthGetServerSession(
      undefined as any,
      undefined as any,
      authOptions as NextAuthOptions
    );
    return session as Session | null;
  } catch (err) {
    return null;
  }
}
