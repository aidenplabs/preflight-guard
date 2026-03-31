# Preflight Report

This checked-in sample intentionally shows a strong-match supported caution case.
It demonstrates how a meaningful review-oriented caution should read for a supported combination.

## Project Summary
- Scanned path: `/demo/next-supabase-vercel-app`
- Scanned at: `2026-03-29T00:00:00.000Z`
- Files scanned: 75

## Detected Stack
- Base profile: `nextjs-core`
- Detected combination: `nextjs-core+supabase-pack+vercel-pack`
- Combination label: `Next.js + Supabase + Vercel`
- Active packs: `supabase-pack`, `vercel-pack`
- Combination status: `supported`
- Overall confidence: `high`
- Profile fit: `strong-match`
- Summary: Detected a strong Next.js + Supabase + Vercel combination match with high confidence.
- Coverage note: Supported-combination confidence is high enough for a useful clean scan signal, but the scan remains heuristic rather than a proof of safety.
- **Next.js**: detected (high, score 8/8) — package.json includes next@13.4.10; next.config file found; Next.js route files found (9); middleware present (middleware.ts)
- **Supabase**: detected (high, score 9/9) — package.json includes Supabase dependency (^2.26.0); supabase/ directory found; Supabase env names or client creation found in code; Supabase-related env variables found
- **Vercel**: detected (medium, score 3/6) — package.json includes Vercel package(s): @vercel/analytics, @vercel/og; Vercel env names or package references found

## Findings By Severity

## Blocker
No findings in this severity.

## High
No findings in this severity.

## Medium

### Sensitive route or server action may be missing an auth check
- Rule ID: `SB003`
- Severity: **Medium**
- Confidence: `review-needed`
- Category: `supabase-auth`
- File: `app/actions.ts`
- What was found: This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.
- Why it matters: Delete, update, admin, storage, invite, and billing flows often need explicit access control. Missing checks can expose data or privileged actions.
- Minimum fix: Review the handler or action and add a clear auth guard before sensitive work if one is actually missing.
- Evidence: Server-side file contains mutation or privileged-action keywords. | Project has middleware files (middleware.ts), but middleware was not treated as proof that this route is protected.

### Sensitive route or server action may be missing an auth check
- Rule ID: `SB003`
- Severity: **Medium**
- Confidence: `review-needed`
- Category: `supabase-auth`
- File: `app/api/chat/route.ts`
- What was found: This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.
- Why it matters: Delete, update, admin, storage, invite, and billing flows often need explicit access control. Missing checks can expose data or privileged actions.
- Minimum fix: Review the handler or action and add a clear auth guard before sensitive work if one is actually missing.
- Evidence: Server-side file contains mutation or privileged-action keywords. | Project has middleware files (middleware.ts), but middleware was not treated as proof that this route is protected.

## Final Recommendation
- Ship: **caution**
- Recommendation basis: `elevated-review-findings`
- Recommendation note: Multiple or stronger review-needed findings triggered. This caution is more than a weak review note and should be treated as a meaningful pre-deploy stop-and-review signal.

## Limitations
- This scanner uses heuristic static checks only. It does not prove that auth, RLS, or deployment config are safe.
- The detected Next.js combination is inside the current supported model, but the scan still only covers a narrow set of static patterns.
- Findings marked review-needed or likely still need human review against the real app behavior and deployment intent.
