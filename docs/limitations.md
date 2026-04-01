# Limitations

This project is intentionally narrow.

## What it does not do

It does not:
- prove security
- prove auth correctness
- prove RLS correctness
- verify runtime behavior
- replace manual review
- act like a broad security scanner

## What can still go wrong

- false positives can happen
- false negatives can happen
- a clean scan does not mean the app is safe
- a review finding does not automatically mean the app is broken
- a blocker finding is still heuristic, even when it is strong enough to stop a launch

## Why it is narrow

The project is focused on:
- a small set of high-signal patterns
- supported Next.js combinations only
- plain-language output for beginner or solo builders

That means it deliberately does not try to cover every framework, provider, or security issue.

## Browser-reachable limit

The browser-reachable logic is heuristic.
It is intentionally narrower than full data-flow analysis.

Do not read its output as proof that the scanner understands every import chain or runtime path.

## Supported stack limit

Supported combinations today:
- `Next.js + Vercel`
- `Next.js + Supabase`
- `Next.js + Supabase + Vercel`

`nextjs-core` alone is still review-only.
