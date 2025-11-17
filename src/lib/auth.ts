import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcrypt";
import argon2 from "argon2";
import type { NextAuthOptions } from "next-auth";
import { getDb } from "./mongodb";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import type { Session } from "next-auth";

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
        const db = await getDb();
        const user = await db
          .collection("users")
          .findOne({ email: credentials.email });
        console.log("Credentials authorize called for", credentials.email);
        if (!user) {
          console.log("User not found for", credentials.email);
          return null;
        }
        console.log(
          "User passwordHash (preview):",
          typeof user.passwordHash === "string"
            ? user.passwordHash.slice(0, 8) + "..."
            : String(user.passwordHash)
        );
        if (!user.passwordHash) {
          console.log("No passwordHash for user", credentials.email);
          return null;
        }
        let match = false;
        try {
          match = await bcrypt.compare(credentials.password, user.passwordHash);
        } catch (e) {
          match = false;
        }
        // If bcrypt compare failed, try argon2 (existing users may use argon2)
        if (
          !match &&
          typeof user.passwordHash === "string" &&
          user.passwordHash.startsWith("$argon2")
        ) {
          try {
            match = await argon2.verify(
              user.passwordHash,
              credentials.password
            );
          } catch (e) {
            match = false;
          }
        }
        console.log("Password match for", credentials.email, match);
        if (!match) return null;
        // Return the user object that will be stored in the session JWT
        return {
          id: user._id.toString(),
          name: user.name || null,
          email: user.email,
        } as any;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
      }
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
