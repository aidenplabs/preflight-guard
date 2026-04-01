# Public Validation Benchmark

This file is the compact hosted/public validation record for the current project.

It is not a full test matrix.
It is a small benchmark used to answer one practical question:

Can the current supported combinations produce low-noise, reviewable results on a few meaningful public targets?

Most validation work should stay local-only by default.
This file should only change when a validation run materially improves the public proof story.

## Current Product Boundary

Supported combinations:
- `Next.js + Vercel`
- `Next.js + Supabase`
- `Next.js + Supabase + Vercel`

Review-only:
- `nextjs-core` alone

The scanner remains heuristic.
These benchmark results are useful evidence, not proof of security.

## Benchmark Case Types

### `clean-supported`
- supported combination
- strong-match
- `ship: yes`
- recommendation basis: `clean-supported-scan`

### `supported-review-needed`
- supported combination
- strong-match
- `ship: caution`
- recommendation basis: `review-findings`
- expected when the scanner finds one concrete review-oriented issue

### `supported-elevated-review`
- supported combination
- strong-match
- `ship: caution`
- recommendation basis: `elevated-review-findings`
- expected when repeated or stronger review-oriented findings trigger

### `weak-match` / `review-only`
- no strong supported combination
- clean scans should still be read cautiously
- commonly lands on `ship: caution` with `insufficient-supported-confidence`

### `unsupported` / `out-of-scope`
- not part of the current support model
- useful for boundary-checking, not for support claims

## AI Handoff Prompt Rubric

Use this compact rubric when checking whether a generated AI handoff prompt is actually good enough to keep.

### `diagnosis clarity`
- the finding is restated in plain language
- the prompt explains what was detected vs what still needs inspection

### `beginner readability`
- a beginner can understand the repair goal without already knowing the stack internals
- the prompt avoids scanner-internal jargon where plain wording is possible

### `file targeting usefulness`
- the first files listed are real repo paths or high-confidence folder anchors
- the prompt does not rely on made-up helper paths when repo-local signals are available

### `scope control / anti-refactor safety`
- the prompt explicitly says what not to rewrite
- the prompt pushes the assistant toward the smallest safe repair instead of broad cleanup

### `actionability for AI coding assistants`
- the prompt tells the assistant what to inspect before editing
- the prompt asks for a concrete output shape, not a vague essay

### `validation checklist quality`
- the checklist is specific enough to verify the exact finding after edits
- the checklist stays honest about heuristic limits and remaining uncertainty

## AI Handoff Usability Loop

Keep this small.
For now, validate only one `SB003` case and one `SB004` case at a time.

Current supported AI handoff findings:
- `SB001`
- `SB002`
- `SB003`
- `SB004`
- `ENV002`

Current AI handoff expansion status:
- prompt expansion is paused for now
- `SB002` now has AI handoff support and a reduced blocker-response pack, but it still does not have a full execution-help pack
- `ENV004` remains `NO-GO` and should not be treated as the next prompt-expansion target
- this file should not imply an active prompt-candidate race while that branch is paused

### What counts as a good AI response
- starts with a short diagnosis grounded in the flagged files
- lists the exact files inspected before proposing edits
- proposes the smallest plausible repair or explicitly says no safe edit is justified yet
- explains why the proposed change is narrow enough
- reports what still remains uncertain

### What counts as an over-broad AI response
- rewrites auth structure, middleware, routing, or deployment config without a clear need
- proposes broad refactors or cleanup outside the flagged path
- changes unrelated UI, data flow, or framework setup

### What counts as a fake fix or scanner-gaming response
- adds placeholder guards, comments, or fake helper calls without making the real path clearer
- adds placeholder SQL or fake policy files just to silence `SB004`
- claims the issue is resolved without pointing to repo-visible evidence

### What counts as an unclear beginner-facing response
- uses stack jargon without explaining the practical repair goal
- skips the file-inspection step
- gives only generic advice instead of a repo-local next step

## Current AI Handoff Test Cases

### `SB003` usability case
- target: `fixtures/v3/missing-route-auth`
- expected role: supported elevated-review auth/path case
- why this case matters:
  - tests whether the prompt keeps the assistant local to the flagged server route
  - tests whether the assistant avoids broad auth rewrites

### `SB004` usability case
- target: `Halo-Lab/next-supabase-todo`
- expected role: supported review-needed RLS/policy case
- why this case matters:
  - tests whether the prompt points to real repo-visible Supabase helper paths
  - tests whether the assistant avoids fake policy-file fixes when repo context is incomplete

## Current Public Proof Anchors

| Case type | Public target | Combination | Profile fit | Ship | Recommendation basis | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `clean-supported` | `vercel/example-marketplace-integration` | `Next.js + Vercel` | `strong-match` | `yes` | `clean-supported-scan` | Current clean hosted anchor for the Vercel path |
| `clean-supported` | `vercel/platforms` | `Next.js + Vercel` | `strong-match` | `yes` | `clean-supported-scan` | Current second clean public anchor for the Vercel path; now also directly confirmed through the hosted public-target workflow |
| `clean-supported` | `vercel/nextjs-subscription-payments` | `Next.js + Supabase` | `strong-match` | `yes` | `clean-supported-scan` | Current clean business-shaped public anchor for the Supabase path |
| `clean-supported` | `KolbySisk/next-supabase-stripe-starter` | `Next.js + Supabase + Vercel` | `strong-match` | `yes` | `clean-supported-scan` | Current clean hosted anchor for the triple-combination path |
| `supported-review-needed` | `Halo-Lab/next-supabase-todo` | `Next.js + Supabase` | `strong-match` | `caution` | `review-findings` | Current supported review-needed anchor; concrete finding was `SB004` |
| `supported-elevated-review` | `imbhargav5/nextbase-nextjs-supabase-starter` | `Next.js + Supabase` | `strong-match` | `caution` | `elevated-review-findings` | Current elevated-review public anchor; repeated `SB003` findings made this a meaningful stop-and-review case |
| `supported-elevated-review` | `supabase-community/vercel-ai-chatbot` | `Next.js + Supabase + Vercel` | `strong-match` | `caution` | `elevated-review-findings` | Current elevated-review public anchor for the supported triple-combination path; repeated `SB003` findings stayed coherent on rerun |
| `weak-match` / `review-only` | `vercel/nextjs-portfolio-starter` | `Next.js` | `strong-match` | `caution` | `insufficient-supported-confidence` | Current review-only Vercel-boundary anchor; clean scan, but not a supported pack combination |

## Curated Validation Target List

Keep the validation list small and intentional.
Do not use random public repos just because they are easy to scan.

### `public-anchors`
- `vercel/example-marketplace-integration`
  - role: current hosted clean anchor for `Next.js + Vercel`
- `vercel/platforms`
  - role: current second clean public anchor for `Next.js + Vercel` breadth
- `vercel/nextjs-portfolio-starter`
  - role: current review-only boundary public anchor for Vercel-like Next.js repos
- `vercel/nextjs-subscription-payments`
  - role: current clean business-shaped public anchor for `Next.js + Supabase`
- `KolbySisk/next-supabase-stripe-starter`
  - role: current hosted clean anchor for `Next.js + Supabase + Vercel`
- `Halo-Lab/next-supabase-todo`
  - role: current hosted caution anchor for `Next.js + Supabase`
- `imbhargav5/nextbase-nextjs-supabase-starter`
  - role: current elevated-review public anchor for `Next.js + Supabase`
- `supabase-community/vercel-ai-chatbot`
  - role: current elevated-review public anchor for `Next.js + Supabase + Vercel`

### `local-controls`
- `fixtures/v18/nextjs-vercel-clean`
  - role: local clean control for `Next.js + Vercel`
- `fixtures/v18/nextjs-supabase-clean`
  - role: local clean control for `Next.js + Supabase`
- `fixtures/v18/nextjs-supabase-vercel-clean`
  - role: local clean control for `Next.js + Supabase + Vercel`
- `fixtures/v3/missing-route-auth`
  - role: local elevated-review control for `SB003`
- `fixtures/v3/unsafe-public-service-role`
  - role: local blocker control for `ENV002`
- `fixtures/v29/browser-service-role-client`
  - role: local blocker control for `SB001`

### `deeper-local-only`
- none currently

## Repeatable Validation Loop

Use the smallest loop that answers the current question:
1. run `local-controls` first
2. run `public-anchors` only when you need to recheck public proof
3. run `deeper-local-only` only when a decision boundary is still unclear
4. keep clones and generated outputs local-only unless a run materially improves public proof

Local runner:

```bash
npm run validate:curated
npm run validate:curated -- --group public-anchors
npm run validate:curated -- --group deeper-local-only
npm run validate:curated -- --group local-controls --only local-sb003-elevated-review
```

Local output behavior:
- generated reports go to `.preflight-curated/`
- public GitHub clones go to `/tmp/preflight-curated-validation`
- both are local-only by default and should not be committed
- accumulated local snapshots live in `.preflight-curated/latest.json`, `.preflight-curated/last-run.json`, and `.preflight-curated/history.jsonl`
- local comparison views live in `.preflight-curated/report.json` and `.preflight-curated/report.md`

## Promotion Rules

### Keep a result local-only
- it only reconfirms an existing anchor
- it is exploratory or still ambiguous
- it helps internal interpretation but does not materially sharpen public proof

### Update this benchmark doc
- it adds a new benchmark case type
- it becomes the clearest current anchor for an existing case type
- it materially changes the business conclusion about support quality or caution behavior

### Update public sample outputs
- the output shape changed materially
- the checked-in sample became stale or misleading
- a new public-facing feature needs one clear example to stay understandable

## What These Results Already Prove

- the hosted public-target workflow can exercise all three supported combinations
- one already-promoted strong-match supported public anchor has now been directly confirmed through the hosted public-target workflow
- clean supported results are possible on strong-match public targets
- supported strong-match repos can produce both softer and stronger caution states on public targets
- public proof now includes:
  - all three supported combinations
  - more than one clean public anchor for the `Next.js + Vercel` path
  - softer and stronger Supabase caution anchors
  - one review-only boundary anchor for a Vercel-like Next.js repo
- the current support model is no longer backed only by local fixtures or self-scans

## What Still Needs Better Evidence

- one honest public blocker anchor, if a trustworthy candidate exists
- broader externally reviewable hosted proof than the single directly confirmed strong-match supported target
- continued evidence that Supabase cautions stay review-oriented rather than noisy or blocker-happy

## Top Next Validation Targets

1. One honest public blocker anchor, only if it comes from a trustworthy, stable, non-random public target.
Reason: blocker behavior is still mostly fixture-backed, so this is the highest-value remaining proof gap.

2. Real AI handoff behavior validation on the existing prompt-supported findings.
Reason: the hosted-proof gap is now smaller, so the next best differentiator check is whether the current narrow prompts actually drive good assistant behavior.

## Reuse Loop

When a new hosted public-target run is worth keeping:
1. prefer `npm run validate:curated -- --group public-anchors` for local rechecks
2. use `.github/workflows/public-target-validation.yml` when you need externally reviewable hosted proof
3. review the summary and uploaded reports
4. update this file only if the run adds a new benchmark case, a better anchor, or a clearer business conclusion

Do not turn this into a giant matrix.
Keep only the highest-signal cases.
