# Preflight

A heuristic pre-deploy checker for Next.js + Supabase + Vercel projects, with a very narrow experimental Firebase prototype.

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

Experimental prototype:
- `nextjs-firebase-vercel`
- experimental means detection and a few checks exist, but it should not be treated as mature support
- even a clean-looking Firebase prototype scan may still return `ship: caution` by design

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
- experimental Firebase Admin / service-account misuse patterns

## Limitations

This project is heuristic only.

Important limits:
- it does not prove auth correctness
- it does not prove RLS correctness
- it does not validate runtime behavior
- it may miss real issues
- it may produce false positives
- it is intentionally specific to a small set of Next.js + Vercel stack patterns
- `ship: yes` must not be interpreted as proof of security
- the experimental Firebase profile should not be treated as mature support yet

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
- local prototype fixtures for:
  - a clean-ish Firebase experimental case
  - an unsafe Firebase experimental case

Hosted Action note:
- the hosted Action path has now been exercised in a real remote run
- this repo self-scan returned `ship: caution`, which is expected because this repo is a weak-match scanner repo, not a strong Next.js + Supabase + Vercel target-stack app
- that result validates the Action path, not the security of this repo

Experimental Firebase note:
- the Firebase prototype has now also been checked against a small public-repo sample
- public Firebase validation is still small and should be treated as early signal, not maturity
- a clean-ish Firebase fixture currently returns `ship: caution`, not `ship: yes`, because the prototype is intentionally not treated as mature support yet

What is still incomplete:

- public-repo validation sample size is still small
- trust/scoring is still heuristic, not empirical proof
- hosted validation has only been exercised on a weak-match self-scan so far, not yet on a strong-match production-like target repo
- the Firebase prototype is intentionally not ready to call mature support

Firebase public-repo note:
- a small public validation pass was run against repos including:
  - `leerob/nextjs-vercel-firebase`
  - `MartinXPN/nextjs-firebase-mui-starter`
  - `valyndsilva/chatgpt-clone`
  - `chirag-23/ChatGPT-Clone-Nextjs`
- in that sample, Firebase profile detection was directionally useful, but the prototype stayed intentionally quiet and mostly returned `ship: caution` with no findings
- one trust-tuning fix was made after validation: Vercel confidence no longer gets an extra boost from lockfiles or other package-manager artifacts
- no clearly risky public Firebase repo with committed credential material was kept in the final sample, so unsafe Firebase validation is still mainly covered by the repo fixtures

## Public positioning

This project should be described honestly as:

- a heuristic pre-deploy helper
- a narrow scanner led by Next.js + Supabase + Vercel
- a review-support tool, not a proof-of-security tool
- a project with one validated primary wedge and one very narrow experimental Firebase prototype

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
- an experimental Firebase profile prototype exists
- a small public Firebase validation pass exists, but it still supports an experimental label rather than mature support

Ready for:
- basic public/open-source release, with risk

Not ready to claim:
- proof of security
- mature broad-framework support
- deep runtime correctness validation
- mature public support for the Firebase prototype yet

## Development direction

Near-term next steps:
- exercise the hosted Action on a strong-match target-stack repo in addition to this weak-match self-scan
- validate against more representative public repos
- decide whether Firebase should continue as the second wedge based on more public-repo validation, or stay frozen as an experimental prototype

Internal v6 direction, not current support:
- the current reusable core is the CLI, project loading, scoring, reporting, and rule-pack plumbing
- the current validated wedge remains Next.js + Supabase + Vercel
- the Firebase prototype is experimental and intentionally narrower than the first wedge

Out of scope for now:
- dashboard / SaaS expansion
- multiple user-facing profiles
- broad framework support
- deep semantic analysis rewrite
- enterprise policy engine

## License

Add your preferred license here.
