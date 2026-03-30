You are helping design and build a security-focused developer tool.

Project direction:
We are NOT trying to build a generic security scanner, broad AppSec platform, or enterprise security dashboard.
We are building a narrow, practical, developer-friendly pre-deploy security checker for vibe-coded apps.

Current product direction:
A CLI-first tool, with future SaaS/GitHub Action expansion, focused on:
- Next.js + Supabase + Vercel apps
- beginner / student / hackathon / solo vibe-coder users
- pre-deploy security checks
- simple, practical, fix-first reporting

Core differentiation:
This tool should NOT compete head-on with broad scanners like generic SAST/SCA/secrets platforms.
Instead, it should be:
1. stack-aware
2. beginner-friendly
3. deployment-focused
4. fix-oriented
5. narrow and opinionated

What the tool should focus on first:
A. Supabase RLS / auth mistakes
B. public env / secrets / config exposure

Examples of the kinds of issues we care about:
- service role key exposed in client-side code
- dangerous use of NEXT_PUBLIC_ for sensitive values
- suspicious env handling patterns
- missing or weak Supabase RLS assumptions
- auth exists, but route / API / server action protection looks incomplete
- unsafe config or exposure patterns that commonly happen in fast AI-built projects

What this tool is NOT:
- not a full web app pentesting platform
- not a full SAST replacement
- not an enterprise compliance product
- not multi-framework from day 1
- not a giant dashboard product
- not a broad AI security platform

Product philosophy:
- narrow scope beats broad scope
- practical checks beat academic completeness
- clear “ship / caution / no-ship” output beats noisy vulnerability spam
- beginner-friendly explanations matter
- every finding should help the user fix something quickly
- false confidence is dangerous, so uncertainty should be stated clearly

Target user:
Primary:
- students
- hackathon builders
- solo vibe-coders shipping side projects quickly

Secondary later:
- small teams / small startup builders

Preferred output style of the tool:
- severity levels such as Blocker / High / Medium
- beginner-readable explanation
- what was found
- why it matters
- where it was found
- minimum suggested fix
- final deploy recommendation:
  - ship: no
  - ship: caution
  - ship: yes

Preferred product shape:
Phase 1:
- open-source CLI
- local repo scan
- markdown + JSON report output

Phase 2:
- GitHub Action
- better CI integration
- optional SaaS wrapper

Architecture preference:
Build the tool so it can later support more stack profiles.
Current profile:
- nextjs-supabase-vercel

Future idea:
- stack profiles or modular rule packs
Examples:
- nextjs-firebase-vercel
- react-node-railway
- custom frontend/backend/deploy combinations

Important build constraints:
- do not over-engineer
- do not build enterprise features yet
- do not add dashboards, auth systems, billing, accounts, teams, or complex web UI in v1
- do not support too many frameworks in v1
- avoid pretending we can detect everything
- make limitations explicit

How to help in future conversations:
When suggesting features, always ask:
1. does this directly support the core differentiation?
2. does this help beginner vibe-coders ship safer?
3. is this specific to the chosen stack?
4. is this worth adding in v1, or should it wait?

If something is too broad, reduce it.
If something overlaps too much with existing generic scanners, make it narrower and more stack-specific.
Prefer a tool that does fewer things clearly over a tool that does many things badly.

Whenever proposing implementation, use this priority:
1. repo / stack detection
2. rules for Supabase RLS / auth mistakes
3. rules for env / secret / config exposure
4. result scoring
5. markdown / JSON reporting
6. future extensibility

Always optimize for:
- clear scope
- real usability
- portfolio quality
- practical MVP execution

---

# v1 implementation

## Scope summary

This repo now contains a v1-only CLI MVP for a narrow pre-deploy security checker.

It is intentionally limited to:
- local repo scans
- Next.js + Supabase + Vercel heuristics
- a small high-value ruleset
- terminal, Markdown, and JSON output

It does not try to be:
- a generic SAST scanner
- a complete auth or RLS verifier
- a dashboard or SaaS product
- a multi-framework security platform

## Proposed repo structure

```text
src/
  cli.ts
  project.ts
  scan.ts
  score.ts
  stack.ts
  reporters.ts
  rules.ts
  types.ts
  utils.ts
examples/
  sample-preflight-report.md
  sample-preflight-report.json
context.md
```

Why this structure exists:
- `cli.ts`: binary entrypoint and argument parsing
- `project.ts`: repo file loading with minimal ignore rules
- `stack.ts`: target stack detection heuristics
- `rules.ts`: small v1 rule pack
- `score.ts`: ship recommendation and exit codes
- `reporters.ts`: terminal, Markdown, and JSON outputs
- `scan.ts`: orchestration for a full scan
- `types.ts`: shared models for future GitHub Action / SaaS reuse
- `context.md`: rolling implementation notes for this repo

## v1 implementation plan

1. detect whether the repo looks like Next.js + Supabase + Vercel
2. run a small heuristic ruleset
3. score findings into `ship: yes`, `ship: caution`, or `ship: no`
4. print a terminal summary and write Markdown + JSON reports
5. keep module boundaries simple so new stack profiles or rule packs can be added later

## Exact v1 rules

Supabase / auth:
- `SB001`: possible Supabase service role exposure in client-reachable code
- `SB002`: suspicious privileged Supabase key usage in browser-reachable client setup
- `SB003`: sensitive route or server action may be missing an auth check
- `SB004`: Supabase detected without clear RLS policy signals

Env / secrets / config:
- `ENV001`: possible hardcoded secret or token in source
- `ENV002`: sensitive-looking value exposed through `NEXT_PUBLIC_` naming
- `ENV003`: privileged environment value referenced in client-reachable code
- `ENV004`: wildcard CORS found in server-side handler

## What v1 checks

v1 looks for:
- likely Next.js, Supabase, and Vercel usage
- service role exposure patterns
- suspicious client-side privileged env usage
- likely missing auth guards in obviously sensitive server files
- missing RLS signals in Supabase-oriented repos
- hardcoded secret patterns
- unsafe public env naming
- a small config exposure pattern with wildcard CORS

## What v1 does not check

v1 does not:
- prove a project is secure
- fully validate Supabase RLS policies
- deeply understand every auth flow
- inspect runtime behavior
- perform browser testing or dynamic analysis
- support other framework stacks

## How to run it

Install dependencies:

```bash
npm install
```

Run against the current repo:

```bash
npm run scan
```

Run against another path:

```bash
npm run dev -- scan ../my-app
```

Build the CLI:

```bash
npm run build
```

Use the built binary:

```bash
./dist/cli.js scan ../my-app
```

## How to interpret results

- `ship: no`: at least one confirmed Blocker or enough High-risk findings that deployment should pause
- `ship: caution`: findings need review, or the target stack confidence is not strong enough for a reliable clean scan
- `ship: yes`: no current v1 findings triggered and the repo looks like a strong match for the intended stack

Confidence matters:
- `confirmed`: the pattern is direct and likely real
- `likely`: the signal is strong, but still heuristic
- `review-needed`: human review is required before acting

Coverage matters too:
- a clean scan is only a meaningful `ship: yes` signal when target stack confidence is high
- partial or weak stack detection should be treated as caution, even with zero findings

## Exit codes

- `0`: ship yes
- `1`: ship caution
- `2`: ship no
- `3`: usage or runtime failure

## Example outputs

- Markdown example: [`examples/sample-preflight-report.md`](examples/sample-preflight-report.md)
- JSON example: [`examples/sample-preflight-report.json`](examples/sample-preflight-report.json)

## v2 scope

v2 builds on the existing v1 codebase without changing the product shape.

What belongs in v2:
- better stack/profile confidence quality
- a cleaner internal rule-pack structure for the current stack
- better finding quality with clearer evidence and confidence handling
- more useful reports for local CLI use and future GitHub Action integration

What still does not belong yet:
- more frameworks
- live cloud or runtime scanning
- dashboard or SaaS backend
- accounts, billing, teams, or enterprise policy features
- broad generic SAST ambitions

## What improved in v2

- stack detection now uses scored project signals instead of only simple presence heuristics
- reports now show `profile fit` as `strong-match`, `partial-match`, or `weak-match`
- stack components now expose signal-backed scores in reports
- rules are now organized as a simple rule pack for `nextjs-supabase-vercel`
- findings now include evidence text to show why they were flagged
- sensitive route and config findings use slightly better context signals to reduce misleading output

## Current architecture

The current codebase stays intentionally small:

```text
src/
  cli.ts
  project.ts
  signals.ts
  scan.ts
  score.ts
  stack.ts
  reporters.ts
  rules.ts
  rule-packs/
    registry.ts
    nextjs-supabase-vercel.ts
  types.ts
  utils.ts
fixtures/
  v3/
    ...
```

This is still a CLI-first tool with one active stack profile. v2 only adds enough internal structure to support future rule packs or stack profiles later without rewriting the scan pipeline.

## v3 scope

v3 strengthens trust, tuning, and internal extensibility without changing the product shape.

What changed in v3:
- a lightweight rule-pack registry now selects the active pack internally
- realistic repo fixtures are checked into the repo for repeatable tuning
- trust-sensitive wording was tuned so high-confidence clean scans still read as heuristic
- duplicate public-env findings are reduced when the env file already shows the root issue

What still stays out of scope:
- GitHub Action packaging
- multiple supported stack profiles
- dynamic/runtime validation
- dashboard or SaaS features
- broad scanner expansion

## v4 scope

v4 packages the existing scanner for practical GitHub Action and CI usage without changing the core product shape.

What changed in v4:
- a composite GitHub Action now runs the scanner in CI
- the CLI now supports `--fail-on caution|no|never` for explicit CI policy control
- JSON output now includes a stable `schemaVersion` and the effective `exitCode`
- the scanner now creates output directories automatically for CI artifact paths
- a minimal example workflow shows how to run the Action and upload reports

What remains out of scope:
- broader scanner expansion
- multiple user-facing profiles
- SaaS or dashboard features
- runtime validation
- major rule-set expansion

## GitHub Action / CI usage

The repo now includes a composite Action in [`action.yml`](action.yml) and an example workflow in [`.github/workflows/preflight-example.yml`](.github/workflows/preflight-example.yml).

Action inputs:
- `path`: repo path to scan, default `.`
- `output-dir`: directory for generated reports, default `.preflight-ci`
- `fail-on`: CI policy, one of `caution`, `no`, or `never`

Action outputs:
- `ship-recommendation`
- `stack-confidence`
- `profile-fit`
- `exit-code`
- `json-report-path`
- `markdown-report-path`

CI behavior:
- `fail-on: caution`: fail the step on `ship: caution` or `ship: no`
- `fail-on: no`: fail the step only on `ship: no`
- `fail-on: never`: always succeed, but still emit outputs and reports

Important:
- `ship: yes` still means “no current heuristic findings on a strong-match scan,” not proof that the app is secure.
- JSON output is intended for downstream automation, while Markdown remains the human-readable review artifact.

## v5 validation and release readiness

v5 keeps the product shape the same and focuses on real usage validation plus basic public/open-source readiness.

What was validated:
- local CLI behavior on clean, unsafe, caution, and weak-match fixtures
- public-repo scans against small representative Next.js + Supabase repos:
  - `supabase-community/vercel-ai-chatbot`
  - `SarathAdhi/next-supabase-auth`
  - `Navin-Jethwani-76/nextjs-supabase-template`
- JSON and Markdown reports in practical scan outputs

What changed from validation:
- the sensitive-route heuristic was narrowed so generic `.delete()` calls and cache revalidation helpers no longer create obvious false positives
- the RLS review finding now points to `package.json` when no better repo-local Supabase policy path exists, instead of blaming an example env file
- generated limitation wording no longer refers to an old version number

What remains unvalidated:
- a real hosted GitHub Actions run was not exercised from this workspace because the current local folder is not a Git repository connected to a pushable GitHub repo

Release-positioning guidance:
- this is a narrow, heuristic pre-deploy checker for Next.js + Supabase + Vercel projects
- it is not a generic SAST tool, not a runtime validator, and not proof that an app is secure
- `ship: yes` should be read as “no current heuristic findings on a strong-match scan,” not as a security guarantee
