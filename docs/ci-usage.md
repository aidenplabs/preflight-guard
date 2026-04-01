# CI Usage

This repo includes a composite GitHub Action in `action.yml`.

## What it does

The action:
- installs dependencies
- builds the CLI
- runs the scan
- writes Markdown and JSON reports
- exposes useful outputs for later steps
- writes a compact job summary

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

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run preflight
        uses: ./
        with:
          path: .
          output-dir: .preflight-ci
          fail-on: no
```

## Useful inputs

- `path`
  - repo path to scan
- `output-dir`
  - where the reports should be written
- `fail-on`
  - `never`, `no`, or `caution`

## Useful outputs

- `ship-recommendation`
- `recommendation-summary`
- `recommendation-basis`
- `combination`
- `support-status`
- `stack-confidence`
- `profile-fit`
- `json-report-path`
- `markdown-report-path`

## Important limit

The GitHub Action is still only a heuristic review step.
It is not proof that an app is safe to deploy.
