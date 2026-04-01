# Quick Start

This project gives you a simple pre-launch scan for a small set of risky patterns in supported Next.js apps.

## 1. Install dependencies

```bash
npm install
```

## 2. Build the CLI

```bash
npm run build
```

## 3. Scan your project

Run from the repo you want to check:

```bash
npm run dev -- scan .
```

Write reports to a custom folder:

```bash
npm run dev -- scan . --output .preflight-ci
```

## 4. Read the result

The scan will give you one of these recommendations:
- `ship: yes`
- `ship: caution`
- `ship: no`

The scan also writes:
- `preflight-report.md`
- `preflight-report.json`

## 5. Choose CI behavior

```bash
npm run dev -- scan . --fail-on never
npm run dev -- scan . --fail-on no
npm run dev -- scan . --fail-on caution
```

Meaning:
- `never`
  - never fail the process because of the recommendation
- `no`
  - fail only on `ship: no`
- `caution`
  - fail on `ship: caution` or `ship: no`

## 6. Keep the limits in mind

This project is:
- heuristic
- narrow
- useful for pre-launch review

It is not:
- proof that an app is safe
- runtime verification
- a full security audit
