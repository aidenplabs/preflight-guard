# Context

## Current build status
- v2 is now in progress and implemented on top of the existing v1 codebase.
- The CLI shape is unchanged, but stack confidence, rule organization, and report quality have been improved.
- v1 remains closed unless a new trust-breaking issue is discovered.
- A focused v2 validation and tuning pass has now been run against realistic synthetic sample repos.

## Files created or changed
- `package.json`: project metadata, CLI scripts, and minimal dev dependencies.
- `package-lock.json`: lockfile created by `npm install`.
- `tsconfig.json`: TypeScript build settings for a small Node CLI.
- `src/types.ts`: shared scan, stack, and finding models.
- `src/cli.ts`: CLI entrypoint with `scan` command parsing.
- `src/project.ts`: local repo file loading with basic ignore rules.
- `src/stack.ts`: heuristic detection for Next.js, Supabase, and Vercel.
- `src/rules.ts`: v1 ruleset for Supabase/auth and env/secrets/config issues.
- `src/score.ts`: ship recommendation and exit code mapping.
- `src/reporters.ts`: terminal, Markdown, and JSON report generation.
- `src/signals.ts`: project-context signal collection for routes, middleware, env files, and stack-related files.
- `src/scan.ts`: scan orchestration.
- `src/utils.ts`: small shared helpers for route and client detection.
- `src/rule-packs/nextjs-supabase-vercel.ts`: current stack rule pack with clearer evidence and confidence handling.
- `.gitignore`: ignores build output, dependencies, and generated reports.
- `examples/sample-preflight-report.md`: example Markdown output for docs and future validation.
- `examples/sample-preflight-report.json`: example JSON output for docs and future CI integration.
- `README.md`: kept product direction and added v1 implementation, rules, usage, and output details.
- `context.md`: rolling implementation context for v1.
- Review-driven changes after v1:
- `src/project.ts`: now skips symlinks and oversized files to avoid reading outside the repo or consuming unbounded memory.
- `src/utils.ts`: client detection is now stricter, and auth signals no longer treat generic server helpers as proof of protection.
- `src/rules.ts`: narrowed over-broad service-role and `NEXT_PUBLIC_` heuristics, improved RLS path reporting, and deduplicated findings.
- `src/score.ts`: `ship: yes` now requires strong target-stack confidence instead of only zero findings.
- `src/scan.ts`: scan limitations now reflect weak stack confidence directly.
- `src/reporters.ts`: reports now warn when clean scans are not strong safety signals.
- `README.md`: interpretation guidance updated to reflect stricter stack-confidence behavior.
- v2 changes:
- `src/stack.ts`: now uses scored project signals and reports a `profileFit` for stronger stack-aware detection.
- `src/rules.ts`: now acts as a thin rule-engine entrypoint over the active rule pack.
- `src/reporters.ts`: now shows profile fit, per-component scores, and finding evidence.
- `examples/sample-preflight-report.md`: should reflect the v2 output shape.
- `examples/sample-preflight-report.json`: should reflect the v2 output shape.
- validation/tuning changes:
- `src/project.ts`: now reads real-world env files like `.env.local` and `.env.production`.
- `src/rule-packs/nextjs-supabase-vercel.ts`: now treats direct `NEXT_PUBLIC_*SERVICE_ROLE*` env definitions as a stronger blocker signal.
- `examples/sample-preflight-report.md`: updated to match the tuned env-exposure behavior.
- `examples/sample-preflight-report.json`: updated to match the tuned env-exposure behavior.

## Key assumptions
- TypeScript/Node.js is the best fit for v1 because the target users are in the Next.js ecosystem and future GitHub Action support will be easier.
- v1 should use heuristic static checks only and explicitly avoid deep auth or policy verification.
- Runtime dependencies are unnecessary for the first MVP.

## Important design decisions
- Keep the architecture shallow: CLI entrypoint, project loading, stack detection, rules, scoring, reporters.
- Use severity plus confidence to drive a simple ship recommendation.
- Keep findings beginner-readable and fix-first.
- Avoid runtime dependencies and heavy CLI frameworks in v1.
- Keep rules in one file for now; the interface is simple enough to split into rule packs later without rewriting the scan pipeline.
- v2 keeps one active stack profile but introduces one rule-pack module instead of growing one monolithic rules file.
- v2 uses project-context signals as lightweight shared context rather than deep AST analysis or large framework-specific parsers.
- v2 keeps `ship / caution / no` unchanged to preserve the CLI contract.

## Limitations of the current implementation
- The scanner is heuristic only and may produce false positives or miss real issues.
- Auth and RLS checks are intentionally shallow and pattern-based.
- The current file loader only reads a limited set of text-based extensions.
- The scanner can still detect partial stack confidence from source patterns even when the full target stack is not present.
- Report output paths are fixed to `preflight-report.md` and `preflight-report.json` in v1.
- v2 improves profile fit reporting, but still does not prove framework presence or deployment safety.

## Open questions for me
- None yet.

## Known issues or risks
- The scanner is still heuristic and may miss real issues or produce review-needed findings that turn out to be safe.
- The wildcard CORS rule is still broad and may flag intentionally public endpoints.
- The hardcoded secret regex is still conservative and may miss some real secrets while also catching placeholders.
- Sensitive route detection still relies on keyword heuristics and cannot prove an auth guard is present or absent.
- Stack detection is safer than before, but still not strong enough to prove framework presence without real project signals.

## What should be done next after v1
- Gather a few real sample Next.js + Supabase + Vercel repos to tune false positives and false negatives.
- If v2 starts later, add a profile/rule-pack registry without changing the CLI contract.
- Add optional CLI flags for custom output filenames only if real usage demands it.

## v2 scope
- improve stack-aware detection quality
- improve rule organization for future extensibility
- improve finding quality and reduce false positives / false negatives
- keep the same CLI-first shape
- keep beginner-friendly ship / caution / no-ship reporting

## Review summary
- v1 closure check: no remaining blocker or high issue was found that should block v2 work.
- v2 implementation is intentionally small and reuses the existing v1 pipeline instead of rebuilding it.

## Design decisions
- Keep one active profile: `nextjs-supabase-vercel`.
- Add `project signals` as lightweight shared context for both profile detection and rule quality.
- Add `profileFit` to make clean-scan trust boundaries clearer.
- Add evidence on findings so beginners can see why a heuristic fired.

## Remaining risks
- v2 still relies on heuristic string and path signals rather than deeper semantic analysis.
- Sensitive route detection is better organized, but still cannot prove access control correctness.
- Stack/profile fit is more useful now, but still not a substitute for real sample validation on production-like repos.
- Pages Router and mixed server/client files are still an edge area where the current heuristics may miss real issues to avoid overclaiming.

## What should wait for v3
- multiple stack profiles
- richer rule-pack registration
- GitHub Action packaging details beyond JSON-friendly output
- any dynamic or runtime validation

## What still needs manual review from me
- Decide whether the new `profile fit` wording is clear enough for beginner users.
- Validate v2 against a few real target-stack repos to tune scores and thresholds.
- Decide whether the current rule/evidence wording feels trustworthy enough for public use.

## Validation summary
- Clean strong-match sample: returned `ship: yes`, which matches expectation.
- Unsafe strong-match sample with public service-role env: initially returned only `caution`, which was too soft.
- Sensitive route sample without auth: returned `caution` with a strong warning, which matches the intended heuristic behavior.
- Safe sensitive-route sample with explicit `auth.getUser()`: returned `ship: yes`, which shows the route heuristic is not firing blindly.
- Weak-match sample: returned `caution`, which avoids false reassurance.

## Issues found
- High: `.env.local` and related env files were not being scanned, which weakened real-world detection quality.
- High: a direct `NEXT_PUBLIC_*SERVICE_ROLE*` definition in an env file was not strong enough to force `ship: no`.
- Medium: sample output files had drifted from the tuned v2 behavior.

## Files changed
- `src/project.ts`
- `src/rule-packs/nextjs-supabase-vercel.ts`
- `examples/sample-preflight-report.md`
- `examples/sample-preflight-report.json`
- `context.md`

## Remaining risks
- Validation used realistic synthetic samples, not real public repos, so more tuning against actual target-stack projects is still needed.
- Some stack scoring thresholds are still subjective and may need adjustment after real-repo testing.
- Evidence wording is clearer now, but beginners may still over-trust `ship: yes` unless the limitations section is read.

## Is v2 ready to serve as the base for v3
- Yes, with risk.
- v2 is now coherent enough to base v3 on because clean/unsafe/weak-match behavior is directionally sound and the most obvious trust gap from validation was fixed.
- The next step should be growth from this structure, not another rewrite.

## Review summary
- Review status: pass with risk.
- Main review outcome: the original v1 built and ran, but it was too willing to reassure on weak stack matches and too loose in several security heuristics.
- Main trust fixes applied:
- weak stack confidence no longer produces `ship: yes`
- symlinked files are no longer read
- oversized files are skipped
- client-reachable detection is stricter
- auth-check detection is stricter
- `NEXT_PUBLIC_` severity/confidence is less overstated

## Issues found
- Blocker: clean scans could return `ship: yes` even when target stack confidence was weak.
- Blocker: the loader could read symlink targets outside the scanned repo.
- High: browser-reachable detection treated many server files as client files, especially in Next.js App Router layouts and pages.
- High: auth-check detection treated setup helpers like `createServerClient`, `cookies`, and `headers` as if they proved auth protection.
- High: `NEXT_PUBLIC_` sensitive-name detection was too broad and overconfident.
- Medium: the RLS review finding could point to `supabase/` even when that path did not exist.
- Medium: duplicate findings could be emitted for the same rule and file.

## Remaining risks
- The scanner still does not validate real runtime auth behavior or Supabase policy correctness.
- Findings that depend on naming, keyword matches, or shallow code patterns still need human review.
- Some legitimate client exposure cases in Pages Router files may now be missed because the client heuristic was tightened to reduce false positives.

## What still needs manual review from me
- Validate the rules against a few real Next.js + Supabase + Vercel projects.
- Decide whether `ship: caution` exit code `1` matches your intended CLI and CI workflow.
- Review whether the current rule set feels narrow and trustworthy enough for beginner users.

## Verification performed
- `npm install --cache /tmp/harness-codex-lab-npm-cache`: passed.
- `npm run check`: passed.
- `npm run build`: passed.
- `npm run dev -- scan /tmp/preflight-review-empty`: passed, returned `ship: caution` for a non-target repo with no findings.
- `npm run dev -- scan /tmp/preflight-review-client`: passed, returned `ship: no` for explicit client-side service-role usage.
- `npm run dev -- scan /tmp/preflight-review-server`: passed, avoided a false positive for a server component without `use client`.
- `npm run dev -- scan /tmp/preflight-review-symlink`: passed, did not follow a symlinked `.env` file outside the repo.

## v3 scope
- improve current rule quality using realistic sample repos in the repo
- tune score thresholds, confidence, wording, and evidence where needed
- make finding/report wording more trustworthy for beginner users
- introduce a cleaner lightweight rule-pack registration structure
- keep one active profile in product behavior while making future profile support cleaner internally
- preserve the current CLI contract

## v3 files changed
- `src/types.ts`
- `src/rules.ts`
- `src/rule-packs/registry.ts`
- `src/rule-packs/nextjs-supabase-vercel.ts`
- `src/stack.ts`
- `src/scan.ts`
- `src/reporters.ts`
- `fixtures/v3/clean-app/*`
- `fixtures/v3/unsafe-public-service-role/*`
- `fixtures/v3/missing-route-auth/*`
- `fixtures/v3/safe-route-auth/*`
- `fixtures/v3/weak-match/*`
- `README.md`
- `examples/sample-preflight-report.md`
- `examples/sample-preflight-report.json`
- `context.md`

## v3 major design decisions
- keep one active profile in actual product behavior
- use a lightweight registry, not a plugin system
- keep realistic validation fixtures in the repo so tuning stays reviewable
- prefer wording/evidence tuning over broader feature growth

## v3 tuning and validation work
- added repo-local fixtures for:
- `fixtures/v3/clean-app`
- `fixtures/v3/unsafe-public-service-role`
- `fixtures/v3/missing-route-auth`
- `fixtures/v3/safe-route-auth`
- `fixtures/v3/weak-match`
- validated that:
- clean strong-match repos can still reach `ship: yes`
- direct public service-role env exposure reaches `ship: no`
- sensitive routes without local auth produce `caution`
- safe sensitive routes with explicit auth do not get flagged
- weak-match repos remain at `caution`
- tuned duplicate `ENV002` behavior so code references do not repeat the same root public-env issue when the env file already shows it
- tuned coverage wording so high-confidence results are still explicitly framed as heuristic
- corrected the displayed Supabase score maximum to match the current scoring model

## v3 remaining risks
- the scanner is still heuristic and can miss issues or understate complex auth problems
- profile and component scoring are still judgment calls tuned from small realistic fixtures, not broad empirical data
- the fixture set is realistic enough for tuning, but it is still smaller and simpler than real public production repos
- some beginner users may still read `ship: yes` more strongly than intended unless they also read the limitations

## What should come next after v3
- a later packaging phase for GitHub Action / CI integration
- more real-repo validation against representative target-stack apps
- only after that, any internal preparation for a second profile

## v4 scope
- package the scanner for GitHub Action / CI usage
- preserve the existing CLI behavior as much as possible
- make JSON output reliable for automation use
- keep Markdown output useful for human review
- make exit-code behavior explicit and intentional for CI
- add the minimum Action packaging structure needed
- document CI usage clearly and honestly

## v4 files changed
- `src/types.ts`
- `src/scan.ts`
- `src/cli.ts`
- `src/reporters.ts`
- `src/project.ts`
- `action.yml`
- `.github/workflows/preflight-example.yml`
- `.gitignore`
- `README.md`
- `context.md`

## v4 major design decisions
- keep the CLI as the source of truth and wrap it with a composite Action instead of creating a second execution path
- add one small CI-facing flag, `--fail-on`, rather than changing the default local CLI policy
- keep JSON report generation file-based and expose Action outputs by reading the generated JSON
- preserve one active profile in behavior and avoid exposing internal profile structure as a user feature

## v4 packaging and validation work
- added a composite Action in `action.yml`
- added an example workflow in `.github/workflows/preflight-example.yml`
- added `schemaVersion` and `exitCode` to the JSON report structure for automation use
- added `--fail-on caution|no|never` to the CLI for explicit CI policy control
- ensured report output directories are created automatically
- ignored `fixtures/` during normal scans so repo-local validation fixtures do not pollute scanner output
- ignored `.preflight-ci` in git
- validated:
- local CLI still runs
- built CLI works with `--fail-on never`, `--fail-on no`, and `--fail-on caution`
- clean strong-match fixture still behaves as expected
- unsafe fixture still fails as expected
- caution fixture still behaves as expected
- JSON output includes stable automation fields
- Action/workflow shape is coherent for GitHub Actions usage

## v4 remaining risks
- the scanner is still heuristic and should not be interpreted as proof of safety in CI
- the composite Action installs dependencies and builds on each run, which is simple but not optimized
- the example workflow shape is validated statically here, not by an actual hosted GitHub Actions run in this repo
- JSON schema is intentionally small and stable, but future changes should be versioned carefully

## What should come next after v4
- real hosted validation of the Action on GitHub
- more representative target-stack repo validation before expanding adoption claims
- optional CI ergonomics improvements only if real usage shows a need

## v5 scope
- validate the packaged scanner in real usage conditions
- validate the current scanner against a small representative set of public target-stack repos
- record validation results clearly
- make only narrow fixes justified by validation
- improve README wording for honest public/open-source usage
- keep the existing CLI and Action shape unchanged unless validation shows a concrete trust issue

## v5 files changed
- `src/utils.ts`
- `src/rule-packs/nextjs-supabase-vercel.ts`
- `src/scan.ts`
- `README.md`
- `examples/sample-preflight-report.md`
- `examples/sample-preflight-report.json`
- `context.md`

## v5 major design decisions
- treat public-repo validation as the source of truth for fixes instead of speculative rule expansion
- keep the Action packaging shape unchanged because validation did not reveal a packaging bug
- prefer narrowing noisy heuristics over adding more rules
- document unvalidated hosted-Action behavior explicitly instead of overstating readiness

## v5 validation and release-readiness work
- verified local fixture behavior still matches the intended product shape:
- `fixtures/v3/clean-app` => `ship: yes`
- `fixtures/v3/missing-route-auth` => `ship: caution`
- `fixtures/v3/unsafe-public-service-role` remained the unsafe blocker case during earlier v4 validation and the v5 heuristic changes did not touch that path
- cloned and scanned representative public repos:
- `supabase-community/vercel-ai-chatbot`
- `SarathAdhi/next-supabase-auth`
- `Navin-Jethwani-76/nextjs-supabase-template`
- review outcome from public repos:
- the sensitive-route heuristic was too broad because generic `.delete()` usage and cache revalidation patterns created obvious false positives
- the RLS review finding was directionally useful, but pointing at `.env.example` or `.env.local.example` was misleading
- hosted GitHub Actions validation was not completed from this workspace because the local folder is not a Git repository connected to a pushable GitHub repo
- release-readiness docs updated to say clearly what was validated, what was fixed, and what remains unvalidated

## v5 remaining risks
- the scanner is still heuristic and still cannot prove auth, RLS, or deployment safety
- hosted GitHub Actions execution is still not fully validated in a real remote run
- public-repo validation covered a small sample, not a large corpus
- some server-side actions that rely on indirect auth context may still produce review-needed findings
- `ship: yes` can still be over-trusted by beginners unless they read the limitations and coverage notes

## What should come next after v5
- run the Action in a real hosted GitHub Actions workflow on a pushable GitHub repo
- validate against a few more representative public target-stack repos before making stronger trust claims
- if public usage starts, add only small documentation and CI ergonomics improvements driven by real feedback
