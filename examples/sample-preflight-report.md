# Preflight Report

This checked-in sample intentionally shows a strong-match supported caution case.
It now also demonstrates the first structured execution-help block for a supported finding.

## Project Summary
- Scanned path: `/demo/next-supabase-vercel-auth-review`
- Scanned at: `2026-03-29T00:00:00.000Z`
- Files scanned: 6

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
- **Next.js**: detected (high, score 6/8) — package.json includes next@15.2.1; Next.js route files found (1); middleware present (middleware.ts)
- **Supabase**: detected (high, score 9/9) — package.json includes Supabase dependency (2.49.1); supabase/ directory found; Supabase env names or client creation found in code; Supabase-related env variables found
- **Vercel**: detected (medium, score 3/6) — vercel.json found; Vercel env names or package references found

## Findings By Severity

## Blocker
No findings in this severity.

## High

### Sensitive route or server action may be missing an auth check
- Rule ID: `SB003`
- Severity: **High**
- Confidence: `likely`
- Category: `supabase-auth`
- File: `src/app/api/admin/delete-user/route.ts`
- What was found: This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.
- Why it matters: Delete, update, admin, storage, invite, and billing flows often need explicit access control. Missing checks can expose data or privileged actions.
- Minimum fix: Review the handler or action and add a clear auth guard before sensitive work if one is actually missing.
- Evidence: Server-side file contains mutation or privileged-action keywords. | Route or action path looks sensitive. | Project has middleware files (middleware.ts), but middleware was not treated as proof that this route is protected.

## Medium
No findings in this severity.

## Final Recommendation
- Ship: **caution**
- Recommendation basis: `elevated-review-findings`
- Recommendation note: Multiple or stronger review-needed findings triggered. This caution is more than a weak review note and should be treated as a meaningful pre-deploy stop-and-review signal.

## AI Handoff Prompts
These prompts are copy-paste helpers for a coding assistant.
They do not guarantee a safe or correct patch, and they should not be treated as auto-remediation.

### SB003 Sensitive route or server action may be missing an auth check
- Finding key: `SB003:src/app/api/admin/delete-user/route.ts`
- Prompt version: `1`
- Combination: `nextjs-core+supabase-pack+vercel-pack`
- Support status: `supported`

```text
You are helping with a narrow pre-deploy repair inside an existing Next.js repo.
Do not do a broad rewrite.
Detected combination: Next.js + Supabase + Vercel (nextjs-core+supabase-pack+vercel-pack)
Support status: supported
Finding: SB003 Sensitive route or server action may be missing an auth check
Severity: High
Confidence: likely

Current diagnosis:
This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.

Why it matters:
Delete, update, admin, storage, invite, and billing flows often need explicit access control. Missing checks can expose data or privileged actions.

Likely files to inspect first:
- src/app/api/admin/delete-user/route.ts
- middleware.ts

Minimum safe repair goal:
Decide whether this sensitive route or server action already has a real local auth or authorization guard. If it does, make that guard explicit in the file. If it does not, add the smallest clear guard before the sensitive work happens.

Constraints:
- Do not replace the app's auth system.
- Do not add a broad middleware or framework rewrite just to satisfy this finding.
- Do not assume middleware alone proves route protection unless the file itself makes the authorization path clear.
- Do not treat a client-side guard as proof that a server-side mutation path is protected.
- Keep the change local to the flagged handler or action unless one shared helper is clearly the smallest safe fix.
- If repo-visible evidence is still too weak to justify a safe edit, stop after diagnosis and explain what is missing instead of inventing a fix.
- If repo context is insufficient, inspect the flagged files first and explain what auth path is actually in use before editing.

Expected output from the coding assistant:
- Brief diagnosis of the current auth path for the flagged route or action.
- Exact files inspected.
- Minimal change proposed or applied.
- If no safe minimal edit is justified yet, say that explicitly instead of manufacturing one.
- Why the new or clarified guard is the narrowest safe fix.
- Any remaining uncertainty.

Validation checklist after edits:
- Confirm the sensitive route or action now contains a clear local auth or authorization step.
- Confirm unauthenticated or unauthorized callers can no longer reach the sensitive server-side path by default.
- Confirm the change does not silently broaden access or break the existing request flow.
- Re-run the project's preflight scan and report whether SB003 cleared or still appears.

Do not perform unrelated refactors. Stay tightly scoped to the flagged auth check path.
```

## Execution Help Packs
These structured execution-help blocks are currently generated only for supported SB003 and SB004 findings.
They are more guided than the basic AI handoff prompts, but they are still not auto-remediation and they do not guarantee a safe or correct patch.

### SB003 Sensitive route or server action may be missing an auth check
- Finding key: `SB003:src/app/api/admin/delete-user/route.ts`
- File: `src/app/api/admin/delete-user/route.ts`
- Combination: `nextjs-core+supabase-pack+vercel-pack`
- Support status: `supported`

#### Repair Brief
Review the flagged server-side path and make the auth or authorization decision explicit where the sensitive work happens. Prefer a local guard in the handler or action, or one shared helper only if that helper is already the real auth path in this repo.

#### Ordered Fix Steps
1. Inspect the flagged file and the nearest auth helper or middleware files to identify the current server-side auth path.
2. If a real local guard already exists indirectly, make that guard explicit near the sensitive mutation or route logic.
3. If no guard exists, add the smallest clear server-side auth or authorization check before the sensitive work happens.
4. Re-run preflight and confirm the guarded path is clearer and the finding is reduced or explained.

#### Copy-Paste Prompt Pack

##### diagnose-and-fix
- Intent: Use this first to inspect the current auth path and make the narrowest safe edit.

```text
You are helping with a narrow pre-deploy repair inside an existing Next.js repo.
Do not do a broad rewrite.
Detected combination: Next.js + Supabase + Vercel (nextjs-core+supabase-pack+vercel-pack)
Support status: supported
Finding: SB003 Sensitive route or server action may be missing an auth check
Severity: High
Confidence: likely

Current diagnosis:
This server-side file looks sensitive, but the tool did not find a clear local auth guard or user validation inside it.

Why it matters:
Delete, update, admin, storage, invite, and billing flows often need explicit access control. Missing checks can expose data or privileged actions.

Likely files to inspect first:
- src/app/api/admin/delete-user/route.ts
- middleware.ts

Minimum safe repair goal:
Decide whether this sensitive route or server action already has a real local auth or authorization guard. If it does, make that guard explicit in the file. If it does not, add the smallest clear guard before the sensitive work happens.

Constraints:
- Do not replace the app's auth system.
- Do not add a broad middleware or framework rewrite just to satisfy this finding.
- Do not assume middleware alone proves route protection unless the file itself makes the authorization path clear.
- Do not treat a client-side guard as proof that a server-side mutation path is protected.
- Keep the change local to the flagged handler or action unless one shared helper is clearly the smallest safe fix.
- If repo-visible evidence is still too weak to justify a safe edit, stop after diagnosis and explain what is missing instead of inventing a fix.
- If repo context is insufficient, inspect the flagged files first and explain what auth path is actually in use before editing.

Expected output from the coding assistant:
- Brief diagnosis of the current auth path for the flagged route or action.
- Exact files inspected.
- Minimal change proposed or applied.
- If no safe minimal edit is justified yet, say that explicitly instead of manufacturing one.
- Why the new or clarified guard is the narrowest safe fix.
- Any remaining uncertainty.

Validation checklist after edits:
- Confirm the sensitive route or action now contains a clear local auth or authorization step.
- Confirm unauthenticated or unauthorized callers can no longer reach the sensitive server-side path by default.
- Confirm the change does not silently broaden access or break the existing request flow.
- Re-run the project's preflight scan and report whether SB003 cleared or still appears.

Do not perform unrelated refactors. Stay tightly scoped to the flagged auth check path.
```

##### verify-after-edit
- Intent: Use this after an edit to confirm the route is actually guarded without broadening the change.

```text
You are reviewing a narrow post-edit verification pass inside an existing Next.js repo.
Do not introduce new rewrites.
Detected combination: Next.js + Supabase + Vercel (nextjs-core+supabase-pack+vercel-pack)
Support status: supported
Finding: SB003 Sensitive route or server action may be missing an auth check

Files to verify first:
- src/app/api/admin/delete-user/route.ts
- middleware.ts

Verification focus:
Confirm that a real server-side auth or authorization check is visible in or immediately before the flagged sensitive path.

Checklist:
- Confirm the sensitive route or action now contains a clear local auth or authorization step.
- Confirm unauthenticated or unauthorized callers can no longer reach the sensitive server-side path by default.
- Confirm the change does not silently broaden access or break the existing request flow.
- Re-run the project's preflight scan and report whether SB003 cleared or still appears.

Expected output:
- Exact files re-checked.
- Whether the narrow fix really addressed the finding.
- Any remaining uncertainty or missing evidence.

Do not turn this into a broad audit. Stay focused on the original finding.
```

#### Verification Checklist
- Confirm the sensitive route or action now contains a clear local auth or authorization step.
- Confirm unauthenticated or unauthorized callers can no longer reach the sensitive server-side path by default.
- Confirm the change does not silently broaden access or break the existing request flow.
- Re-run the project's preflight scan and report whether SB003 cleared or still appears.

#### Safe Fix Guidance
- Prefer a local server-side guard in the flagged file or a clearly reused shared helper that already exists in the repo.
- Keep the change close to the sensitive mutation, delete, admin, billing, or storage path.
- If the file already has a real auth step, clarifying it is safer than rewriting the auth system.

#### Risky Fix Guidance
- Do not treat middleware alone as proof that the flagged route or action is protected.
- Do not rely on a client-side check to protect a server-side mutation path.
- Do not replace the app's auth system or add a broad framework rewrite just to clear this finding.

## Limitations
- This scanner uses heuristic static checks only. It does not prove that auth, RLS, or deployment config are safe.
- The detected Next.js combination is inside the current supported model, but the scan still only covers a narrow set of static patterns.
- Findings marked review-needed or likely still need human review against the real app behavior and deployment intent.
