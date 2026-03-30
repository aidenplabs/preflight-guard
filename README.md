# Preflight

A heuristic pre-deploy checker for Next.js + Supabase + Vercel projects.

It helps surface likely security and configuration risks before deployment.
It does not prove security, auth correctness, RLS correctness, or deployment safety.

## What it is

- a narrow CLI + GitHub Action
- a static heuristic scanner
- a beginner-friendly preflight review tool
- focused on Next.js + Supabase + Vercel projects

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

Target stack:
- Next.js
- Supabase
- Vercel

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

Current supported profile:
- `nextjs-supabase-vercel`

Future expansion direction:
- careful multi-stack groundwork is now in progress internally
- no second stack is publicly supported yet

## Recommendation meaning

### `ship: yes`
No current heuristic findings were found on a strong-match target-stack repo.

This does **not** mean the project is secure.
It only means the current narrow checks did not find a blocker or review-needed issue in a repo that looks like a strong fit for the intended stack.

### `ship: caution`
The scanner found review-needed issues, weak stack confidence, or conditions that should be checked manually before deployment.

### `ship: no`
The scanner found a likely blocker-level issue based on its current heuristic checks.

## Current checks

The exact rule behavior may evolve, but the scanner currently focuses on narrow, practical checks such as:

- risky public environment variable exposure
- likely service-role exposure patterns
- review-needed route or server-action auth patterns
- stack/profile confidence
- review-needed Supabase policy / RLS signals

## Limitations

This project is heuristic only.

Important limits:
- it does not prove auth correctness
- it does not prove RLS correctness
- it does not validate runtime behavior
- it may miss real issues
- it may produce false positives
- it is intentionally specific to Next.js + Supabase + Vercel
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
- `exitCode`

The Markdown report is intended for human review.
The JSON report is intended for automation and CI integration.

## GitHub Action

This repo includes a composite GitHub Action in `action.yml`.

It is designed to reuse the existing CLI instead of creating a separate scanning path.

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

Practical guidance:
- start with `fail-on: never` or `fail-on: no` when validating the Action on a repo that may be a weak-match or self-scan
- expect `ship: caution` on repos that do not look like a strong Next.js + Supabase + Vercel target-stack match, even when no findings trigger
- reserve `fail-on: caution` for repos where you expect the scanner to be evaluating a real target-stack app

## Validation summary

What has been validated so far:

- local fixture validation for:
  - clean strong-match case
  - unsafe blocker case
  - caution case
  - weak-match case
- public-repo validation on a small representative sample
- GitHub Action packaging structure
- a real hosted GitHub Actions run on this repo
- JSON / Markdown output for local and CI-oriented use

Hosted Action note:
- the hosted Action path has now been exercised in a real remote run
- this repo self-scan returned `ship: caution`, which is expected because this repo is a weak-match scanner repo, not a strong Next.js + Supabase + Vercel target-stack app
- that result validates the Action path, not the security of this repo

What is still incomplete:

- public-repo validation sample size is still small
- trust/scoring is still heuristic, not empirical proof
- hosted validation has only been exercised on a weak-match self-scan so far, not yet on a strong-match production-like target repo

## Public positioning

This project should be described honestly as:

- a heuristic pre-deploy helper
- a narrow scanner for Next.js + Supabase + Vercel
- a review-support tool, not a proof-of-security tool
- a project that is preparing for careful future multi-stack expansion without claiming it today

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

Ready for:
- basic public/open-source release, with risk

Not ready to claim:
- proof of security
- mature broad-framework support
- deep runtime correctness validation
- public support for a second stack yet

## Development direction

Near-term next steps:
- exercise the hosted Action on a strong-match target-stack repo in addition to this weak-match self-scan
- validate against more representative public repos
- keep multi-stack groundwork narrow and choose one careful second-stack direction before any broader rollout

Internal v6 direction, not current support:
- the current reusable core is the CLI, project loading, scoring, reporting, and rule-pack plumbing
- the current stack-specific wedge remains Next.js + Supabase + Vercel only
- the most likely next experimental direction is `Next.js + Firebase + Vercel`, but it is not implemented or supported yet

Out of scope for now:
- dashboard / SaaS expansion
- multiple user-facing profiles
- broad framework support
- deep semantic analysis rewrite
- enterprise policy engine

## License

Add your preferred license here.
