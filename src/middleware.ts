import { clerkMiddleware } from "@clerk/nextjs/server";

// Protect all routes except static, api and _next
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
