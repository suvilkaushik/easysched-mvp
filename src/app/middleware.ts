// NOTE: Next.js normally expects middleware at `src/middleware.ts`.
// This file is placed at `src/app/middleware.ts` per project request but may not be picked up by Next's runtime.
// If you want global route middleware, also add `src/middleware.ts` with the same export.

import { clerkMiddleware } from "@clerk/nextjs/server";

// Protect all routes except static, api and _next
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!api|_next|static|.*\\..*).*)"],
};
