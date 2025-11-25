import { clerkMiddleware } from "@clerk/nextjs/server";

// Require authentication for all routes except the root (sign-in page)
export default clerkMiddleware({
  publicRoutes: ["/"],
  signInUrl: "/",
});

export const config = {
  matcher: ["/((?!_next|static|.*\\..*).*)"],
};
