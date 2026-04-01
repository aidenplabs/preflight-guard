# Contributing

Thanks for helping.

## Before you open a change

Please keep the project narrow.

Good contributions:
- improve beginner-facing docs
- tighten current findings
- improve supported-stack clarity
- fix repo hygiene issues
- add small, well-justified validation improvements

Changes that usually do not fit:
- broad scanner expansion
- new stacks without evidence
- hype-heavy marketing copy
- large rewrites that change the project shape

## Development basics

Install dependencies:

```bash
npm install
```

Run type checking:

```bash
npm run check
```

Run helper-boundary validation:

```bash
npm run validate:execution-help
```

Run a scan locally:

```bash
npm run dev -- scan .
```

## Style

- keep changes small
- keep wording honest
- prefer simple language
- do not claim security proof
- do not broaden scope casually

## Pull requests

Please explain:
- what changed
- why it changed
- what you ran to verify it
- any important limits or risks that still remain
