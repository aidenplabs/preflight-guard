# Preflight Report

## Project Summary
- Scanned path: `/demo/next-supabase-app`
- Scanned at: `2026-03-29T00:00:00.000Z`
- Files scanned: 42

## Detected Stack
- Target profile: `nextjs-supabase-vercel`
- Overall confidence: `high`
- Profile fit: `strong-match`
- Summary: Detected a strong Next.js + Supabase + Vercel profile match with high confidence.
- Coverage note: Target stack confidence is high enough for a useful clean scan signal, but the scan remains heuristic rather than a proof of safety.
- **Next.js**: detected (high, score 7/8) — package.json includes next@15.2.1; Next.js route files found (8)
- **Supabase**: detected (high, score 6/9) — package.json includes Supabase dependency (^2.49.1); Supabase env names or client creation found in code
- **Vercel**: detected (medium, score 3/6) — Vercel env names or package references found

## Findings By Severity

## Blocker

### Possible Supabase service role exposure in client-reachable code
- Rule ID: `SB001`
- Severity: **Blocker**
- Confidence: `confirmed`
- Category: `supabase-auth`
- File: `src/app/dashboard/page.tsx`
- What was found: This file looks browser-reachable and directly references `SUPABASE_SERVICE_ROLE_KEY`.
- Why it matters: A leaked service role key can bypass normal client restrictions and expose privileged database or admin access.
- Minimum fix: Move service role usage to trusted server-only code and keep the key in a non-public server environment variable.
- Evidence: Client-reachable file references `SUPABASE_SERVICE_ROLE_KEY` directly.

### Sensitive-looking value exposed through NEXT_PUBLIC_ naming
- Rule ID: `ENV002`
- Severity: **Blocker**
- Confidence: `confirmed`
- Category: `env-secrets-config`
- File: `.env.local`
- What was found: An env file directly defines public sensitive-looking names: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE.
- Why it matters: Variables prefixed with NEXT_PUBLIC_ are exposed to the browser bundle. Sensitive values should not use that prefix.
- Minimum fix: Rename the variable to a server-only name, update code paths that consume it, and rotate the secret if it was already exposed.
- Evidence: A `NEXT_PUBLIC_*SERVICE_ROLE*` variable is defined directly in an env file, which is a strong signal of accidental public exposure.

## High

### Sensitive route or server action may be missing an auth check
- Rule ID: `SB003`
- Severity: **High**
- Confidence: `likely`
- Category: `supabase-auth`
- File: `src/app/api/admin/delete-user/route.ts`
- What was found: This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.
- Why it matters: Delete, update, admin, storage, and cache invalidation flows often need explicit auth enforcement. Missing checks can expose data or privileged actions.
- Minimum fix: Review the handler or action and add a clear auth guard before sensitive work if one is actually missing.
- Evidence: Server-side file contains mutation or privileged-action keywords. | Route or action path looks sensitive. | Project has middleware files (middleware.ts), but middleware was not treated as proof that this route is protected.

## Medium

### Supabase detected without clear RLS policy signals
- Rule ID: `SB004`
- Severity: **Medium**
- Confidence: `review-needed`
- Category: `supabase-auth`
- File: `supabase/`
- What was found: Supabase usage was detected, but the repo does not show obvious migration or SQL policy signals for row level security.
- Why it matters: Many fast-built Supabase apps rely on RLS for data isolation. Missing policies can leave tables more open than intended.
- Minimum fix: Review your Supabase tables and policies. Add migrations or SQL policy files so RLS expectations are explicit and versioned.
- Evidence: Supabase confidence: high. | No Supabase SQL migration files were found.

## Final Recommendation
- Ship: **no**

## Limitations
- This scanner uses heuristic static checks only. It does not prove that auth, RLS, or deployment config are safe.
- The scanner is intentionally narrow and only looks for a small set of Next.js + Supabase + Vercel patterns.
- Findings marked review-needed or likely still need human review against the real app behavior and deployment intent.
