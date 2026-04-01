# Findings

This project supports a small set of finding families.

## Blocker-style findings

### `SB001`

Possible Supabase service-role exposure in browser-reachable code.

What this usually means:
- a browser-side file appears to create or use a Supabase client with service-role behavior

Why it matters:
- service-role access is privileged
- it should not be reachable from browser-side code

### `SB002`

Privileged non-public Supabase credential used in browser-reachable client setup.

What this usually means:
- a browser-side Supabase client is using a non-public credential instead of a public anon key

Why it matters:
- browser-side Supabase code should normally use public URL and anon key values only

Important note:
- `SB002` can overlap with `ENV003`
- clearing one does not automatically prove the other is always gone in every repo

### `ENV002`

Public-sensitive environment variable naming signal.

What this usually means:
- a variable name looks like it exposes something that should not be public

Why it matters:
- the name itself can reveal risky intent or encourage unsafe use

## Review-style findings

### `SB003`

Sensitive route or server action may be missing an auth check.

What this usually means:
- a route or server action looks sensitive, but the file does not show a clear local auth or user check

Why it matters:
- sensitive server-side paths usually need clear access control

### `SB004`

Supabase detected without clear RLS policy signals.

What this usually means:
- the repo uses Supabase, but the scanner could not find clear repo-visible RLS or policy evidence

Why it matters:
- many Supabase apps rely on RLS for data isolation

## Candidate-only findings still visible in runtime

These exist in runtime output but are not promoted as supported families:
- `ENV003`
- `ENV001`

## Reading the recommendation

### `ship: yes`

No current heuristic findings were triggered on a strong-match supported combination.

This is not proof of safety.

### `ship: caution`

Either:
- the scan stayed clean but support confidence was weaker
- or one or more review-needed findings were triggered

### `ship: no`

A blocker-level finding was triggered.

This is a strong stop-and-review signal.
