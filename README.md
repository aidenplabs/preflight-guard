# Preflight

A heuristic pre-deploy checker centered on Next.js, with deeper Supabase and Vercel pack support.

It helps surface likely security and configuration risks before deployment.
It does not prove security, auth correctness, RLS correctness, or deployment safety.

## What it is

- a narrow CLI + GitHub Action
- a static heuristic scanner
- a beginner-friendly preflight review tool
- focused on Next.js apps, with deeper checks when Supabase and/or Vercel are present

## What it is not

- not a full security audit
- not runtime verification
- not proof of safety
- not a generic SAST platform
- not a replacement for manual review

## Why this exists

Small teams, solo builders, students, and hackathon projects often deploy quickly and miss obvious security or configuration problems.
This tool is meant to catch common risky patterns early and make the output easy to understand.

## Current scope

The current scanner is intentionally narrow.

Base profile:
- `nextjs-core`

Active packs:
- `supabase-pack`
- `vercel-pack`

Current behavior:
- scans a local repository
- detects stack confidence and profile fit
- applies narrow heuristic checks
- returns a recommendation:
  - `ship: yes`
  - `ship: caution`
  - `ship: no`
- writes both Markdown and JSON reports
- can run in local CLI usage or GitHub Actions

Current supported combinations:
- `Next.js + Vercel`
- `Next.js + Supabase`
- `Next.js + Supabase + Vercel`

Current review-only state:
- `nextjs-core` alone is detectable, but it is not yet a `ship: yes` support target by itself

## Recommendation meaning

### `ship: yes`
No current heuristic findings were found on a strong-match supported Next.js combination.

This does **not** mean the project is secure.
It only means the current narrow checks did not find a blocker or review-needed issue in a repo that looks like a strong fit for a currently supported combination.

### `ship: caution`
`ship: caution` has two meanings under the modular model:

- review caution: the scanner found specific review-needed issues that should be checked before deployment
- confidence caution: the scan stayed clean, but the detected combination is not support-grade enough for `ship: yes`

Those are not the same situation.
A caution with findings is stronger than a clean weak-match caution.
Some review cautions are also stronger than others:

- a single medium review signal is a softer caution
- repeated route/auth cautions or higher-severity review signals are a stronger caution

The JSON report exposes this through `recommendationBasis` and `recommendationSummary`.

### `ship: no`
The scanner found a likely blocker-level issue based on its current heuristic checks.

## How To Read Supabase Cautions

Most current Supabase cautions are review-oriented rather than proof of a broken app.

Common examples:
- `SB003`: a route or server action looks sensitive, but the tool did not find a clear local auth check
- `SB004`: Supabase was detected, but the repo does not show clear RLS policy signals

Interpret these as:
- review your auth or policy assumptions before shipping
- not as automatic proof that auth or RLS is broken

If the scanner reaches `ship: no`, that is a stronger signal than these review-oriented Supabase cautions.
A single `SB004` caution is also softer than repeated `SB003` route/action cautions across multiple files.

## Current checks

The exact rule behavior may evolve, but the scanner currently focuses on narrow, practical checks such as:

- risky public environment variable exposure
- likely service-role exposure patterns
- review-needed route or server-action auth patterns
- Next.js base and pack confidence
- review-needed Supabase policy / RLS signals

Current pack depth:
- `nextjs-core` identifies the base Next.js target and keeps non-supported combinations from being over-read
- `supabase-pack` currently provides the deeper rule coverage in the active model
- `vercel-pack` currently contributes detection/context and combination confidence more than dedicated findings

## Limitations

This project is heuristic only.

Important limits:
- it does not prove auth correctness
- it does not prove RLS correctness
- it does not validate runtime behavior
- it may miss real issues
- it may produce false positives
- it is intentionally specific to a narrow set of Next.js deployment patterns
- `ship: yes` must not be interpreted as proof of security

## Installation

```bash
npm install
npm run build
```

## Local CLI usage

Run a scan:

```bash
npm run dev -- scan .
```

Run a scan with a custom output directory:

```bash
npm run dev -- scan . --output .preflight-ci
```

Control CI failure policy:

```bash
npm run dev -- scan . --fail-on never
npm run dev -- scan . --fail-on no
npm run dev -- scan . --fail-on caution
```

Policy meaning:
- `never`: never fail the process based on recommendation
- `no`: fail only on `ship: no`
- `caution`: fail on `ship: caution` or `ship: no`

## Output

The scanner writes:
- `preflight-report.md`
- `preflight-report.json`

The JSON report includes stable automation-oriented fields such as:
- `schemaVersion`
- `shipRecommendation`
- `recommendationBasis`
- `recommendationSummary`
- `exitCode`

The Action also exposes CI-friendly outputs such as:
- `ship-recommendation`
- `recommendation-basis`
- `combination`
- `support-status`
- `stack-confidence`
- `profile-fit`

The Markdown report is intended for human review.
The JSON report is intended for automation and CI integration.

Checked-in sample report note:
- the sample report in `examples/` intentionally shows a strong-match supported caution case
- it is there to demonstrate how a review-oriented caution should read, not to imply that every supported repo should default to `ship: caution`

## GitHub Action

This repo includes a composite GitHub Action in `action.yml`.

It is designed to reuse the existing CLI instead of creating a separate scanning path.
It now follows the CLI's own `--fail-on` behavior directly instead of recomputing failure policy outside the scanner.

Example workflow:
- checkout repo
- set up Node
- run the Action
- upload Markdown / JSON reports as artifacts

## Example CI use

A typical policy choice is:

- use `fail-on: never` when you want reports and artifacts without blocking CI
- use `fail-on: no` when you only want likely blockers to fail CI
- use `fail-on: caution` when you want review-needed findings to fail CI too

Current Action default:
- the composite Action now defaults to `fail-on: no`
- this is intentionally less aggressive than `caution`, because some supported-combo cautions are still review-oriented rather than blocker-like

Practical guidance:
- start with `fail-on: never` or `fail-on: no` when validating the Action on a repo that may be outside the supported combination set
- expect `ship: caution` on repos that do not look like a strong supported Next.js combination, even when no findings trigger
- reserve `fail-on: caution` for repos where you expect the scanner to be evaluating one of the currently supported combinations

## Validation summary

What has been validated so far:

- local fixture validation for:
  - Next.js + Vercel
  - Next.js + Supabase
  - Next.js + Supabase + Vercel
- public-repo validation on a small representative sample including:
  - `vercel/example-marketplace-integration`
  - `vercel/nextjs-portfolio-starter`
  - `SarathAdhi/next-supabase-auth`
  - `supabase-community/vercel-ai-chatbot`
  - `Halo-Lab/next-supabase-todo`
  - `imbhargav5/nextbase-nextjs-supabase-starter`
  - `vercel/nextjs-subscription-payments`
  - `KolbySisk/next-supabase-stripe-starter`
- GitHub Action packaging structure
- a real hosted GitHub Actions run on this repo
- local hosted-style validation of the built Action path against supported-combination repos
- JSON / Markdown output for local and CI-oriented use

Hosted Action note:
- the hosted Action path has now been exercised in a real remote run
- this repo self-scan returned `ship: caution`, which is expected because this repo is a scanner repo, not a strong supported Next.js combination
- that result validates the Action path, not the security of this repo
- the built Action path has also now been rechecked locally against supported-combination repos to confirm that:
  - Action-facing JSON and Markdown outputs still match the CLI behavior
  - `fail-on: no` keeps review cautions from failing CI by default
  - `recommendationBasis` and combination/support outputs remain usable for CI interpretation

What is still incomplete:

- public-repo validation sample size is still small
- trust/scoring is still heuristic, not empirical proof
- externally reviewable hosted validation has only been exercised on a weak-match self-scan so far, not yet on a strong-match production-like target repo
- `nextjs-core` alone is still review-only rather than a supported clean-scan target
- `vercel-pack` still contributes more to detection/context than to dedicated findings

Current evidence nuance:
- `Next.js + Vercel` remains the cleanest supported path
- some public Next.js repos that are plausibly deployed on Vercel can still resolve as `nextjs-core` review-only if the repo itself does not expose concrete Vercel pack signals such as `vercel.json`, `@vercel/*`, or Vercel env usage
- `Next.js + Supabase` and `Next.js + Supabase + Vercel` can reach either `ship: yes` or `ship: caution` on strong-match repos, depending on whether the scanner sees review-needed auth/RLS signals
- stronger Supabase cautions on public repos are still possible on supported strong-match scans when repeated or higher-severity `SB003` findings trigger
- a single `SB004` RLS review signal is now a softer caution than repeated route/action review findings
- that means a Supabase caution should usually be read as a review request, not as automatic proof that the project is unsafe

## Support model

This project uses a narrow modular support model.

The current active model is:
- base profile: `nextjs-core`
- optional packs: `supabase-pack`, `vercel-pack`
- currently supported combinations:
  - `Next.js + Vercel`
  - `Next.js + Supabase`
  - `Next.js + Supabase + Vercel`

Support claims still require:
- hosted GitHub Action validation in stack-relevant conditions
- stable clean and risky fixture coverage
- public-repo validation beyond one or two examples
- risky-case evidence that is not mostly dependent on synthetic fixtures
- acceptable false-positive / false-negative comfort for beginner-facing use
- clear docs that explain what the scanner can and cannot prove

## Public positioning

This project should be described honestly as:

- a heuristic pre-deploy helper
- a narrow scanner led by Next.js core plus optional Supabase and Vercel packs
- a review-support tool, not a proof-of-security tool
- a project with one active modular Next.js-centered support model

## Who this is for

Best fit:
- solo developers
- students
- hackathon teams
- small teams deploying quickly
- builders who want a simple preflight security/config check before deployment

Less suitable for:
- broad multi-framework security scanning
- compliance-heavy enterprise environments
- deep runtime or policy verification

## Project status

Current status:
- CLI exists
- GitHub Action exists
- fixture-based validation exists
- small public-repo validation pass exists
- hosted GitHub Actions run exists and produced the expected weak-match `ship: caution` self-scan result on this repo
- the active product model is now `nextjs-core` plus `supabase-pack` and `vercel-pack`
- the three minimum supported combinations are now explicit in the repo and fixtures

Ready for:
- a narrow initial public/open-source release, with risk

Not ready to claim:
- proof of security
- mature broad-framework support
- deep runtime correctness validation
- broad provider support beyond the active Next.js-centered model

Initial release boundary:
- ship the CLI and composite GitHub Action as a narrow Next.js-centered pre-deploy helper
- treat the supported combinations as:
  - `Next.js + Vercel`: strongest current path
  - `Next.js + Supabase`: supported, but more review-oriented
  - `Next.js + Supabase + Vercel`: supported, but more review-oriented
- keep `nextjs-core` alone review-only
- keep the default Action policy conservative at `fail-on: no`
- describe Supabase cautions as review requests, not as proof that auth or RLS is broken
- do not claim strong externally reviewable hosted proof yet for a supported strong-match public repo

## First Post-Release Validation Loop

After the initial public release, keep the next loop narrow:

- try to obtain one externally reviewable hosted Action run on a strong-match supported public repo
- keep validating the two Supabase-bearing supported combinations on a small number of public repos
- keep checking whether Vercel-only public repos that look deployment-relevant actually surface enough repo-local Vercel signals to be treated as supported combinations
- keep public examples, workflow docs, and Action wording synchronized with actual scanner behavior
- only add deeper `vercel-pack` findings if real validation shows a clear high-signal gap

## Development direction

Near-term next steps:
- exercise the hosted Action on a strong-match target-stack repo in addition to this weak-match self-scan
- harden and validate the three active supported combinations

Internal direction, not current support:
- the current reusable core is the CLI, project loading, scoring, reporting, and rule-pack plumbing
- the active support model is Next.js core plus optional Supabase and Vercel packs

Out of scope for now:
- dashboard / SaaS expansion
- multiple user-facing profiles
- broad framework support
- deep semantic analysis rewrite
- enterprise policy engine

## License

No license has been selected yet.
