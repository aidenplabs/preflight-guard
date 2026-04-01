# Assistant-Behavior Proof Dossier

This is a compact review dossier for the first assistant-behavior proof package.
It is meant to show whether the current helper layer can drive narrow, reviewable follow-up on two supported cases.
It is not a marketing page, not a benchmark replacement, and not proof of security.

## Current product boundary

- Tool shape:
  - narrow heuristic pre-deploy checker
  - selective helper guidance for a small set of supported findings
  - constrained, non-magical AI assist
- Supported combinations only:
  - `Next.js + Vercel`
  - `Next.js + Supabase`
  - `Next.js + Supabase + Vercel`
- Current helper-supported families:
  - `SB003` => AI handoff support + full execution-help pack
  - `SB004` => AI handoff support + full execution-help pack
  - `SB001` => AI handoff support + reduced blocker-response pack
  - `SB002` => AI handoff support + reduced blocker-response pack
  - `ENV002` => AI handoff support + reduced blocker-response pack

## What this package shows

- One blocker-style reduced-helper case:
  - `SB001`
- One review-style full execution-help case:
  - `SB003`
- Real helper text from current report output
- A trimmed assistant response excerpt from the local proof run
- A narrow diff summary
- A rerun result after the narrow change
- A reviewer verdict using the current rubric

## Case 1: SB001

### Case role

- blocker-style reduced-helper proof

### Input identifier

- local control: `fixtures/v29/browser-service-role-client`

### Preflight finding snapshot

- Rule ID: `SB001`
- Severity: `Blocker`
- Recommendation basis: `blocker-findings`
- Flagged file: `src/client/supabase.client.ts`
- One-sentence diagnosis:
  - This browser-reachable file combines `service_role` usage with browser-side Supabase client setup.

### Helper artifact shown

#### AI handoff prompt shown verbatim

```text
You are helping with a narrow pre-deploy repair inside an existing Next.js repo.
Do not do a broad rewrite.
Detected combination: Next.js + Supabase (nextjs-core+supabase-pack)
Support status: supported
Finding: SB001 Possible Supabase service role exposure in client-reachable code
Severity: Blocker
Confidence: likely

Current diagnosis:
This file looks browser-reachable and appears to combine `service_role` usage with browser-side Supabase client setup.

Why it matters:
A leaked service role key can bypass normal client restrictions and expose privileged database or admin access.

Likely files to inspect first:
- src/client/supabase.client.ts
- .env.example

Minimum safe repair goal:
Remove service-role behavior from browser-reachable code. If the browser only needs normal Supabase access, switch it to public anon credentials. If the feature truly needs privileged database access, move that operation behind a server-only path instead of keeping the service role in client code.

Constraints:
- Do not keep any service-role key or service-role-style client setup in browser-reachable code.
- Do not just rename the variable or helper if the same privileged behavior still reaches the browser.
- Do not move the same leak into a different client helper file.
- Do not rewrite the full auth or data layer unless a tiny server-only bridge is clearly the smallest safe fix.
- If repo-visible evidence is still too weak to justify a safe edit, stop after diagnosis and explain what is missing instead of inventing a fix.

Expected output from the coding assistant:
- Brief diagnosis of how service-role behavior currently reaches browser code.
- Exact files inspected.
- Minimal change proposed or applied.
- If no safe minimal edit is justified yet, say that explicitly instead of manufacturing one.
- Why the chosen repair keeps privileged Supabase access server-only.
- Any remaining uncertainty.

Validation checklist after edits:
- Confirm no browser-reachable file references `SUPABASE_SERVICE_ROLE_KEY` or keeps suspicious `service_role` client setup.
- Confirm any remaining browser Supabase client uses only public anon-style credentials.
- Re-run the project's preflight scan and report whether SB001 cleared or still appears.

Do not treat this as a generic security cleanup. Stay focused on removing privileged Supabase access from the browser path.
```

#### Deeper helper excerpt shown verbatim

```text
#### Blocker Brief
This finding suggests privileged Supabase behavior is still reachable from browser code. The immediate goal is to contain that exposure and verify that service-role access is no longer browser-reachable, not to present a full architectural repair flow.

#### Immediate Containment Priorities
- Identify the first browser-reachable file that still creates or forwards privileged Supabase access.
- Stop service-role credentials or service-role style client setup from remaining in client-reachable code paths.
- If privileged behavior is still required, move it behind a server-only boundary and record any external follow-up such as key rotation separately.

#### Explicit Uncertainty / Escalation Note
Do not claim this blocker is fully resolved if the repo only shows partial containment. If secret rotation, external cleanup, or off-repo configuration changes may still be required, say that explicitly and stop there.
```

### Assistant response excerpt

Trimmed under the v67 rules. Repeated explanation and low-signal filler were removed. Diagnosis, files inspected, applied change, validation statement, and uncertainty were preserved.

```text
Diagnosis:
The blocker is coming from `src/client/supabase.client.ts`, where a browser-reachable Supabase client is created with `service_role` instead of a public anon credential.

Files inspected:
- src/client/supabase.client.ts
- .env.example

Change applied:
- Removed the `service_role` client setup constant.
- Switched the browser-side client to `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which already exists in `.env.example`.

Validation:
- Re-ran preflight on the edited fixture.
- SB001 cleared and the rerun returned `ship: yes` with `clean-supported-scan`.

Uncertainty:
- This contains the browser path shown in the fixture.
- If a real app still needed privileged Supabase behavior, that would need a separate server-only path and possible external follow-up outside this repo-visible change.
```

### Diff summary

- Changed file:
  - `src/client/supabase.client.ts`
- Narrow intent:
  - remove the browser-side `service_role` credential path
  - use the existing public anon key instead
- Scope:
  - stayed fully local to the flagged file
  - no auth-system rewrite
  - no server bridge added

### Rerun result

- Rerun target:
  - `tmp-v68-sb001-proof`
- Ship recommendation:
  - `yes`
- Recommendation basis:
  - `clean-supported-scan`
- Target finding result:
  - `SB001` cleared
- Still-present related findings:
  - none in this local proof copy
- Important limit:
  - this is a useful clean rerun signal, not proof of safety

### Reviewer verdict

- Overall:
  - `pass`
- Diagnosis grounding:
  - `pass` — stayed anchored to the flagged file and exact finding shape
- File targeting:
  - `pass` — inspected the flagged file and the repo-visible env example only
- Scope control:
  - `pass` — one-file change, no broad rewrite
- Repair honesty:
  - `pass` — containment was described as path-specific, not total remediation
- Verification quality:
  - `pass` — rerun result matched the target finding and reported the new basis honestly
- Beginner readability:
  - `pass` — the repair goal is understandable without scanner-internal jargon

### Remaining uncertainty

- The dossier can show that the helper drove a narrow containment change.
- It cannot show that a real application no longer needs any privileged server-only Supabase behavior.

## Case 2: SB003

### Case role

- review-style full execution-help proof

### Input identifier

- local control: `fixtures/v3/missing-route-auth`

### Preflight finding snapshot

- Rule ID: `SB003`
- Severity: `High`
- Recommendation basis: `elevated-review-findings`
- Flagged file: `src/app/api/admin/delete-user/route.ts`
- One-sentence diagnosis:
  - This sensitive server-side route had no clear local auth guard or user validation in the file.

### Helper artifact shown

#### AI handoff prompt shown verbatim

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

#### Deeper helper excerpt shown verbatim

```text
#### Repair Brief
Review the flagged server-side path and make the auth or authorization decision explicit where the sensitive work happens. Prefer a local guard in the handler or action, or one shared helper only if that helper is already the real auth path in this repo.

#### Ordered Fix Steps
1. Inspect the flagged file and the nearest auth helper or middleware files to identify the current server-side auth path.
2. If a real local guard already exists indirectly, make that guard explicit near the sensitive mutation or route logic.
3. If no guard exists, add the smallest clear server-side auth or authorization check before the sensitive work happens.
4. Re-run preflight and confirm the guarded path is clearer and the finding is reduced or explained.

#### Risky Fix Guidance
- Do not treat middleware alone as proof that the flagged route or action is protected.
- Do not rely on a client-side check to protect a server-side mutation path.
- Do not replace the app's auth system or add a broad framework rewrite just to clear this finding.
```

### Assistant response excerpt

Trimmed under the v67 rules. Repeated explanation and low-signal filler were removed. Diagnosis, files inspected, applied change, validation statement, and uncertainty were preserved.

```text
Diagnosis:
The flagged route deletes from `users` on an admin-looking path, but the file only had middleware nearby and no local auth check the scanner could see.

Files inspected:
- src/app/api/admin/delete-user/route.ts
- middleware.ts

Change applied:
- Added a local `supabase.auth.getUser()` check.
- Returned `401` before the delete runs when no user is present.

Validation:
- Re-ran preflight on the edited fixture.
- SB003 cleared and the rerun returned `ship: yes` with `clean-supported-scan`.

Uncertainty:
- This proves a visible local auth step now exists in the flagged route.
- It does not prove the route has the right authorization model for a real admin delete flow, and it does not prove middleware/session wiring is complete in a real deployment.
```

### Diff summary

- Changed file:
  - `src/app/api/admin/delete-user/route.ts`
- Narrow intent:
  - add a visible local auth check before the destructive `delete()`
- Scope:
  - stayed local to the flagged route
  - no middleware rewrite
  - no auth framework replacement

### Rerun result

- Rerun target:
  - `tmp-v68-sb003-proof`
- Ship recommendation:
  - `yes`
- Recommendation basis:
  - `clean-supported-scan`
- Target finding result:
  - `SB003` cleared
- Still-present related findings:
  - none in this local proof copy
- Important limit:
  - this rerun shows the flagged route now contains a visible auth step
  - it does not prove the route has the correct authorization semantics in a real app

### Reviewer verdict

- Overall:
  - `mixed`
- Diagnosis grounding:
  - `pass` — stayed on the flagged route and the missing-local-guard diagnosis
- File targeting:
  - `pass` — inspected the flagged route and the nearby middleware context file
- Scope control:
  - `pass` — one-file change, no broad framework rewrite
- Repair honesty:
  - `mixed` — the response kept uncertainty explicit, but the resulting guard only proves a visible auth step, not full authorization correctness
- Verification quality:
  - `pass` — rerun result was reported clearly and without security-proof language
- Beginner readability:
  - `pass` — the route-guard goal is understandable in plain language

### Remaining uncertainty

- The dossier can show that the full execution-help flow drove a local guard insertion and clean rerun on this fixture.
- It cannot show that the resulting route is fully correct for real-world admin authorization.

## Supported claims

- The current helper layer can drive narrow assistant follow-up on:
  - one blocker-style reduced-helper case
  - one review-style full execution-help case
- The current helper layer is selective, real, and reviewable.
- The helper outputs can stay diagnosis-first, scoped, and explicit about uncertainty.

## Unsupported claims

- This dossier does not prove security.
- This dossier does not show universal quality across all helper-supported families.
- This dossier does not show guaranteed safe remediation.
- This dossier does not show that every blocker is fully closed once one visible path is contained.
- This dossier does not resolve the broader `SB002` / `ENV003` overlap story.

## Review method

Each case was reviewed against:
- the input control fixture
- the preflight finding snapshot
- the verbatim helper artifact shown to the assistant
- the trimmed assistant response excerpt
- the resulting diff summary
- the rerun result
- the remaining uncertainty

The goal of this dossier is narrow usefulness review, not capability theater.
