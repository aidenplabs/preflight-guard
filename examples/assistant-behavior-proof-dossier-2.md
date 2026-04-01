# Assistant-Behavior Proof Dossier 2

This is a compact review dossier for the second assistant-behavior proof artifact.
It is meant to show whether the current reduced blocker helper can stay narrow, reviewable, and honest on a harder blocker case with a real nearby overlap boundary.
It is not a marketing page, not proof of security, and not proof that overlapping findings always clear together.

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

- One harder blocker-style reduced-helper case:
  - `SB002`
- Real helper text from current report output
- A trimmed assistant response excerpt from the local proof run
- A narrow diff summary
- A rerun result after the narrow change
- Explicit overlap handling for `ENV003`
- A reviewer verdict using the current rubric

## Case 1: SB002

### Case role

- blocker-style reduced-helper proof under overlap pressure

### Input identifier

- local control: `fixtures/v32/browser-access-token-client`

### Preflight finding snapshot

- Rule ID:
  - `SB002`
- Severity:
  - `Blocker`
- Recommendation basis:
  - `blocker-findings`
- Flagged file:
  - `src/client/supabase.client.ts`
- One-sentence diagnosis:
  - This browser-reachable file initializes a Supabase client with a non-public Supabase credential.
- Related overlap finding in the same file:
  - `ENV003`
  - `High`
  - client-reachable code references `process.env.SUPABASE_ACCESS_TOKEN`

### Helper artifact shown

#### AI handoff prompt shown verbatim

```text
You are helping with a narrow pre-deploy repair inside an existing Next.js repo.
Do not do a broad rewrite.
Detected combination: Next.js + Supabase (nextjs-core+supabase-pack)
Support status: supported
Finding: SB002 Privileged non-public Supabase credential used in browser-reachable client setup
Severity: Blocker
Confidence: likely

Current diagnosis:
A browser-reachable file appears to initialize a Supabase client with a non-public Supabase credential.

Why it matters:
Browser-side Supabase code should normally use public URL and anon key values only. Non-public Supabase credentials in that client path can expose privileged access.

Likely files to inspect first:
- src/client/supabase.client.ts
- .env.example

Minimum safe repair goal:
Remove the non-public Supabase credential from the browser-reachable client setup path. If the browser only needs standard Supabase access, switch that path to public anon credentials. If the feature truly needs privileged Supabase behavior, move that behavior behind a server-only path instead of keeping the privileged credential in browser-side client setup.

Constraints:
- Do not broaden this into generic env cleanup or claim that every privileged env issue in the repo is fixed.
- Do not treat `ENV003` as automatically resolved unless the broader browser-side privileged env reference is actually gone too.
- Do not just rename the helper or variable if the same non-public Supabase credential still reaches browser-side client initialization.
- Do not imply helper-indirect usage is browser-reachable unless the flagged path is already repo-visibly client-reachable.
- Do not rewrite the app's full data layer unless a tiny server-only bridge is clearly the narrowest safe fix.
- If repo-visible evidence is still too weak to justify a safe edit, stop after diagnosis and explain what is missing instead of inventing a fix.

Expected output from the coding assistant:
- Brief diagnosis of which browser-reachable Supabase client path carries the non-public credential.
- Exact files inspected.
- Minimal containment change proposed or applied.
- If no safe minimal edit is justified yet, say that explicitly instead of manufacturing one.
- Why the chosen change keeps privileged Supabase credentials out of browser-side client setup.
- Any remaining uncertainty, overlap with `ENV003`, or external follow-up still needed.

Validation checklist after edits:
- Confirm the flagged browser-reachable client setup no longer initializes a Supabase client with a non-public credential.
- Confirm any remaining browser Supabase client path uses only public anon-style credentials.
- Re-run the project's preflight scan and report whether SB002 cleared or still appears.

Do not treat this as a generic secret cleanup. Stay focused on the flagged browser-reachable Supabase client setup path.
```

#### Deeper helper excerpt shown verbatim

```text
#### Blocker Brief
This finding suggests a browser-reachable Supabase client path is still using a non-public Supabase credential. The immediate goal is to contain that client path and verify that privileged credentials no longer reach browser-side client initialization, not to present a full architectural repair flow.

#### Immediate Containment Priorities
- Identify the first browser-reachable file that still initializes a Supabase client with a non-public credential.
- Remove `SUPABASE_ACCESS_TOKEN`, `SUPABASE_SECRET`, or `SUPABASE_DB_PASSWORD` from browser-side Supabase client setup instead of shifting the same credential into another client helper.
- If privileged Supabase behavior is still required, move that behavior behind a server-only boundary and record any remaining external follow-up explicitly.

#### Explicit Uncertainty / Escalation Note
Do not claim this blocker is fully resolved if the repo only shows containment of the flagged client setup path. If broader privileged env references, server-only follow-up, or external credential rotation may still be required, say that explicitly and stop there.
```

### Assistant response excerpt

Trimmed under the v67 rules. Repeated explanation and low-signal filler were removed. Diagnosis, files inspected, applied change, validation statement, and uncertainty were preserved.

```text
Diagnosis:
The blocker is coming from `src/client/supabase.client.ts`, where a browser-reachable Supabase client is initialized with `SUPABASE_ACCESS_TOKEN` instead of a public anon credential.

Files inspected:
- src/client/supabase.client.ts
- .env.example

Change applied:
- Switched the browser-side client credential from `SUPABASE_ACCESS_TOKEN` to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Kept the change local to the flagged client setup file.

Validation:
- Re-ran preflight on the edited proof copy.
- SB002 cleared and the rerun returned `ship: yes` with `clean-supported-scan`.
- ENV003 also cleared in this fixture because the same browser-side privileged env reference was removed from the flagged file.

Uncertainty:
- This shows the flagged browser-side client path was contained in this fixture.
- It does not prove that every SB002 case will also clear ENV003, and it does not prove broader privileged-env cleanup elsewhere in a real repo.
```

### Diff summary

- Changed file:
  - `src/client/supabase.client.ts`
- Narrow intent:
  - replace the non-public browser-side Supabase credential with the existing public anon key
- Scope:
  - stayed fully local to the flagged file
  - no helper rewrite
  - no server bridge added
  - no generic env cleanup

### Rerun result

- Rerun target:
  - `.preflight-v72-sb002-proof-work`
- Ship recommendation:
  - `yes`
- Recommendation basis:
  - `clean-supported-scan`
- Target finding result:
  - `SB002` cleared
- Related overlap result:
  - `ENV003` also cleared in this fixture rerun
- Important limit:
  - this rerun shows that one local client-credential edit removed both signals in this control
  - it does not prove that `SB002` and `ENV003` always clear together in other repos

### Reviewer verdict

- Overall:
  - `pass`
- Diagnosis grounding:
  - `pass` — stayed anchored to the flagged file and the exact browser-side client-credential issue
- File targeting:
  - `pass` — inspected the flagged file and the repo-visible env example only
- Scope control:
  - `pass` — one-file change, no broad rewrite
- Repair honesty:
  - `pass` — overlap with `ENV003` was stated explicitly, and the rerun outcome was not generalized beyond this fixture
- Verification quality:
  - `pass` — rerun result reported both the `SB002` outcome and the related `ENV003` outcome directly
- Beginner readability:
  - `pass` — the client-credential containment goal is understandable in plain language

### Remaining uncertainty

- The dossier can show that the reduced helper drove a narrow containment change on a harder blocker case with real overlap pressure.
- It cannot show that all `SB002` cases will have the same overlap outcome.
- It cannot show that broader privileged-env cleanup is complete in a real application.

## Supported claims

- The current reduced blocker helper can drive narrow assistant follow-up on more than one blocker shape.
- The current helper layer can stay explicit about `SB002` / `ENV003` overlap instead of flattening the two families into one generic story.
- The review-dossier format is repeatable beyond the first clean blocker case.

## Unsupported claims

- This dossier does not prove security.
- This dossier does not prove that clearing `SB002` always clears `ENV003`.
- This dossier does not show universal quality across all helper-supported families.
- This dossier does not show guaranteed safe remediation.
- This dossier does not justify generic secret-remediation claims.

## Review method

This case was reviewed against:
- the input control fixture
- the preflight finding snapshot
- the verbatim helper artifact shown to the assistant
- the trimmed assistant response excerpt
- the resulting diff summary
- the rerun result
- the remaining uncertainty

The goal of this dossier is narrow usefulness review under overlap pressure, not capability theater.
