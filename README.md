# Preflight

Preflight is a free open-source guardrail that scans a Next.js repo before launch and points out a small set of risky patterns.

It is for beginner builders, solo builders, students, and small teams using:
- `Next.js + Vercel`
- `Next.js + Supabase`
- `Next.js + Supabase + Vercel`

It is written to be simple to read.
It is not proof that an app is safe.

Looking for the GitHub Action version? See [preflight-guard-action](https://github.com/aidenplabs/preflight-guard-action).

## Who It Is For

Use this project if you:
- are building a Next.js app quickly
- are using Supabase and/or Vercel
- want a simple pre-launch red-flag check
- want plain-language output instead of a large security report

This project is especially useful when code has been assembled quickly from tutorials, snippets, or AI-generated output.

## What It Checks

The scanner is intentionally narrow.

Today it looks for a small set of risky patterns such as:
- browser-side Supabase client setup using a non-public credential
- likely Supabase service-role exposure in browser-reachable code
- sensitive routes or server actions with no clear local auth check
- Supabase projects with no clear repo-visible RLS or policy signals
- public-sensitive environment variable naming patterns

It also:
- detects whether the repo looks like one of the supported stack combinations
- writes a Markdown report and a JSON report
- returns a simple recommendation:
  - `ship: yes`
  - `ship: caution`
  - `ship: no`

## What It Does Not Check

This project does not:
- prove security
- prove auth correctness
- prove RLS correctness
- verify runtime behavior
- replace manual review
- act like a broad security scanner
- cover every possible Next.js, Supabase, or Vercel mistake

## Why Use It

Preflight is meant to catch a few costly mistakes before you deploy.

It is useful when you want:
- a fast pre-launch check
- clear findings in simple language
- a compact GitHub Action summary
- deeper Markdown and JSON artifacts when you want more detail

## Supported Stacks

Supported combinations:
- `Next.js + Vercel`
- `Next.js + Supabase`
- `Next.js + Supabase + Vercel`

Current review-only state:
- `nextjs-core` alone can be detected, but it is not a `ship: yes` support target by itself

## Quick Start

Install dependencies:

```bash
npm install
```

Build the CLI:

```bash
npm run build
```

Run a scan on the current repo:

```bash
npm run dev -- scan .
```

Write reports to a custom directory:

```bash
npm run dev -- scan . --output .preflight-ci
```

Choose how CI should fail:

```bash
npm run dev -- scan . --fail-on never
npm run dev -- scan . --fail-on no
npm run dev -- scan . --fail-on caution
```

## Example Usage

Example local run:

```bash
npm run dev -- scan . --output .preflight-ci --fail-on no
```

Example reports written:
- `.preflight-ci/preflight-report.md`
- `.preflight-ci/preflight-report.json`

## Example Output Summary

Typical CLI summary:

```text
Detected combination: nextjs-core+supabase-pack
Combination label: Next.js + Supabase
Combination status: supported
Ship recommendation: no
Recommendation basis: blocker-findings
Findings: 2 total (1 Blocker, 1 High, 0 Medium)
```

What the recommendation means:
- `ship: yes`
  - no current heuristic findings were triggered on a strong-match supported combination
- `ship: caution`
  - the scan stayed clean but support confidence was weaker, or a review-needed finding was triggered
- `ship: no`
  - a blocker-level finding was triggered

Even `ship: yes` is still only a heuristic clean-scan signal.
It is not proof that the app is safe.

## Findings Overview

Current promoted finding families:
- `SB001`
  - likely Supabase service-role exposure in browser-reachable code
- `SB002`
  - browser-reachable Supabase client setup using a non-public credential
- `SB003`
  - sensitive route or server action with no clear local auth check
- `SB004`
  - Supabase detected without clear repo-visible RLS or policy signals
- `ENV002`
  - public-sensitive environment variable naming signal

Current candidate-only findings still visible in runtime:
- `ENV003`
- `ENV001`

Current `NO-GO` candidate:
- `ENV004`

Some findings also include helper text in the report.
That helper text is still narrow and review-oriented.
It is not auto-remediation.

## GitHub Action Usage

This repo includes a composite GitHub Action in [action.yml](action.yml).

At a high level it:
- installs dependencies
- builds the CLI
- runs the scan
- exposes the recommendation and report paths as Action outputs
- writes a compact job summary

For a beginner-friendly setup example, see [docs/ci-usage.md](docs/ci-usage.md).

## Supporting Examples

The `examples/` folder includes:
- sample reports
- a public validation benchmark note
- two assistant-behavior proof dossiers

These examples are supporting material.
They help explain the project, but they are not proof that every repo or every finding will behave the same way.

## Limitations

Important limits:
- static heuristics only
- narrow supported stack surface
- false positives are possible
- false negatives are possible
- clean output is not proof of safety
- some findings are review-oriented rather than hard blockers

More detail:
- [docs/limitations.md](docs/limitations.md)

## Documentation

Beginner-friendly docs:
- [Quick Start](docs/quickstart.md)
- [Findings](docs/findings.md)
- [Limitations](docs/limitations.md)
- [CI Usage](docs/ci-usage.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Current Roadmap

Current roadmap, in simple terms:
1. Keep the current supported stacks trustworthy and narrow.
2. Improve beginner-friendly documentation and examples.
3. Keep validating the current findings and helper text.
4. Keep the repo clean for open-source use.
5. Revisit public proof surfacing only after the current proof material is strong enough.
6. Consider a separate GitHub Action repo later only if it becomes useful.

Not on the current roadmap:
- paid plans
- AI API features
- dashboard or SaaS packaging
- enterprise SAST positioning
- broad multi-stack expansion

## License

MIT.

See [LICENSE](LICENSE).
