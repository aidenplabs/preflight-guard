# harness-codex-lab AGENTS.md

## Project scope
This repository is for experimenting with Codex, AGENTS.md, and local skills.
Keep changes small and educational.

## Source of truth
- Read this file first for repo rules.
- Prefer existing files and scripts over inventing new structure.
- Do not add extra frameworks or infrastructure unless required by the task.

## File rules
- Keep top-level files minimal.
- Put reusable workflow skills under `.agents/skills/` only when they are specific to this repo.
- Do not create extra folders unless they support the current task.

## Verification
- If the repo has a package manager or build system, prefer its existing commands.
- If no real test suite exists yet, report that clearly.
- For markdown-only changes, no fake verification. Just state that no runnable verification exists.

## Review expectations
- This repo is for learning workflow design, so explain:
  1. changed files
  2. why each file exists
  3. what is global vs repo-local
  4. what should be reused later

## Non-goals
- Do not over-engineer.
- Do not convert this repo into a large framework unless asked.
- Do not add CI, Docker, databases, or external services unless explicitly requested.

## Completion
A task is only complete when:
- the requested files exist
- the contents match the purpose
- the change is reviewed for unnecessary complexity
