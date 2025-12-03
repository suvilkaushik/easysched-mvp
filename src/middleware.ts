import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Require authentication for all routes except the root (sign-in page)
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  if (req.nextUrl.pathname === "/") {
    return;
  }
  if (!userId) {
    const signInUrl = new URL("/", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next|static|.*\\..*).*)"],
};
