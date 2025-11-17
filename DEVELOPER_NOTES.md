Developer notes — Auth + Clients (credentials) changes

Summary

## Lint & TypeScript checks

- Commands run locally (no commits):

```bash
npx eslint . --ext .js,.jsx,.ts,.tsx --fix
npx eslint . --ext .js,.jsx,.ts,.tsx
npx tsc --noEmit
```

- Result: ESLint autofix and TypeScript checks completed locally with no remaining errors reported by `eslint` or `tsc` at the time of the run. If you see any issues locally, re-run the commands above and paste the output.

## Git-ignore updates (local/dev-only files)

I recommend adding the following to `.gitignore` (they are local artifacts, secrets, or build outputs and should not be pushed):

- `/.next/` — Next.js build output (generated during build/deploy).
- `.env*` / `.env.local` — local environment files containing secrets (MONGODB_URI, NEXTAUTH_SECRET, etc.).
- `scripts/sample-credentials.txt` — contains seeded credentials for local testing (sensitive); keep local only.
- `scripts/clients_backup_*` — backups produced by normalization scripts.
- `.next-dev.log` — local development logs.
- `.vscode/` and `.idea/` — editor/IDE settings.

## Will this still work once deployed?

Yes — ignoring local files (build artifacts, `.env.local`, backups, editor settings, logs) will not break deployment as long as your deployment environment provides the required runtime configuration and secrets. Important notes:

- Keep `MONGODB_URI`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` set as environment variables in your hosting environment (Vercel, Fly, Heroku, or your own server). NextAuth and the app use these at runtime/build time.
- Do not ignore files required for build that are part of the repo (e.g., `package.json`, `next.config.ts`, `src/` files) — those must be committed.
- `.next/` is generated during `next build` on the server; it should be ignored locally and will be produced during CI/deploy.

If you want, I can remove `scripts/sample-credentials.txt` from the repository entirely (but I will not do that without your explicit approval). Instead I recommend adding it to `.gitignore` so it won't be accidentally committed.

Developer notes — Auth + Clients (credentials) changes

Summary

- Implemented Credentials-based authentication using NextAuth and MongoDB.
- Normalized `clients` collection to use a single `owner` field (string user id).
- Added server-side protection and owners-only filtering for clients.
- Added clients CRUD API endpoints under `src/app/api/clients`.
- Added DB scripts for inspect, seed, normalization, and E2E testing.

Key files changed/added

- `src/lib/mongodb.ts` — MongoDB helper (memoized client + getDb()).
- `src/lib/auth.ts` — NextAuth options (Credentials provider), password verification (bcrypt + argon2 fallback), `getServerAuthSession()` helper.
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth app-route handler.
- `src/app/providers.tsx` — SessionProvider wrapper used in `layout.tsx`.
- `src/app/login/page.tsx` — simple credentials login page.
- `src/components/Navigation.tsx` — Sign In / Sign Out buttons in header.
- `src/app/clients/page.tsx`, `src/app/client-portal/page.tsx` — server pages that require session and query `clients` by `owner`.
- `src/app/api/clients/route.ts` and `src/app/api/clients/[id]/route.ts` — Clients CRUD API with owner authorization.

Scripts

- `scripts/inspect-db.js` — list collections and sample documents.
- `scripts/seed-users.js` — seed test users and clients. Writes `scripts/sample-credentials.txt` with seeded creds.
- `scripts/normalize-clients.js` — normalize `clients` to the `owner` field (creates a backup collection before changes).
- `scripts/e2e-client-test.sh` — curl-based E2E script that signs in (preserves cookies) and exercises `GET /api/clients`, `POST /api/clients`, `PUT /api/clients/:id`, and `DELETE /api/clients/:id`.
- `scripts/e2e-client-test.js` — Node-based E2E helper (deprecated). Use the shell script instead.

How to run locally

1. Install deps

```bash
npm install
```

2. Ensure `.env.local` contains at least:

- `MONGODB_URI` pointing to your dev MongoDB
- `NEXTAUTH_URL` (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET`

3. Start dev server

```bash
npm run dev
# or to force port 3000
npm run dev -- -p 3000
```

4. Seed test users (optional)

```bash
node scripts/seed-users.js
# this will write sample credentials to scripts/sample-credentials.txt
```

5. Run the curl-based E2E test (sign-in then create/update/delete)

```bash
bash scripts/e2e-client-test.sh
```

6. Manual browser test

- Open `http://localhost:3000` in your browser.
- Click Sign In in the header and use credentials from `scripts/sample-credentials.txt`.

Notes for reviewers / teammates

- Password verification supports both `bcrypt` and `argon2` hashes because some pre-existing user records used Argon2.
- The `clients` collection was normalized to use `owner` (string user id). A backup collection named `clients_backup_<timestamp>` was written by the normalization script.
- API routes use Next.js App Router server (app-route) patterns. Some endpoints redirect to include trailing slashes; the E2E scripts handle that.

If anything fails for you locally, share the server log and the output of `node scripts/inspect-db.js` so I can help diagnose.
