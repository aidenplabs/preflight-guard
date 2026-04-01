# CI Usage

For GitHub workflow use, use the separate action repo:

- `aidenplabs/preflight-guard-action`

This core repo remains the main open-source engine and rule source.

## What it does

The GitHub Action:
- installs and builds its runtime from the action repo
- scans the checked-out workflow repository
- writes Markdown and JSON reports
- exposes useful outputs for later steps
- writes a compact GitHub job summary first
- appends the generated full Markdown report when available

## Basic example

```yaml
name: preflight

on:
  pull_request:
  push:
    branches: [main]

jobs:
  preflight:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run preflight
        uses: aidenplabs/preflight-guard-action@v1
        with:
          path: .
          output-dir: .preflight-ci
          fail-on: no

## Useful Inputs

- `path`
  - path inside the checked-out workflow repository to scan
- `output-dir`
  - directory inside the checked-out workflow repository where reports should be written
- `fail-on`
  - `never`, `no`, or `caution`

## Useful Outputs

- `ship-recommendation`
- `recommendation-summary`
- `recommendation-basis`
- `combination`
- `support-status`
- `stack-confidence`
- `profile-fit`
- `json-report-path`
- `markdown-report-path`
- `exit-code`

## What To Expect

When the action runs, you should expect:

1. A GitHub job summary with a compact recommendation section first
2. The generated full Markdown report appended underneath when available
3. A Markdown report at `OUTPUT_DIR/preflight-report.md`
4. A JSON report at `OUTPUT_DIR/preflight-report.json`

## Important Limit

The GitHub Action is still only a heuristic review step.  
It is not proof that an app is safe to deploy.
