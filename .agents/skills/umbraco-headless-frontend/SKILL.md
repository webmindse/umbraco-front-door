---
name: umbraco-headless-frontend
description: Build a TanStack Start frontend on top of an Umbraco 12+ headless backend that uses the Delivery API with Block List / Block Grid content. Triggers when the user wants to render Umbraco-managed pages where editors can compose pages from an open-ended catalog of block types in any order.
---

# Umbraco Headless Frontend

A reusable, phased workflow for building a TanStack Start frontend against any Umbraco 12+ Delivery API instance. The skill teaches the *pattern*; project-specific values (aliases, colors, fonts, base URL) are collected fresh per project in Phase 0.

## When to use

- Backend is Umbraco 12+ with the Delivery API enabled.
- Pages are composed from Block List and/or Block Grid editors — i.e., editors pick from a catalog of block types and arrange them in any order.
- Frontend stack is TanStack Start (Vite, server functions, file-based routing).

## When NOT to use

- Non-Umbraco CMS (Contentful, Sanity, Strapi, etc.) — the registry pattern still applies but the API client and types differ; this skill's specifics won't fit.
- Umbraco instance without the Delivery API, or with a custom GraphQL/REST layer that doesn't expose `contentType`-tagged blocks.
- Static one-off pages with no editor-driven composition — full plan is overkill.

## Core architectural rules

1. **All Umbraco calls go through `createServerFn`.** The API key is read inside `.handler()` via `process.env.UMBRACO_API_KEY` and never reaches the browser bundle. See `references/server-fn-proxy.md`.
2. **Block rendering is registry-driven.** A single `registry.ts` maps `contentType` alias → React component. `<BlockListRenderer />` and `<BlockGridRenderer />` iterate the editor-ordered array and dispatch. Adding a new block = one new file + one registry line. See `references/block-registry.md`.
3. **Types are generated from the Delivery API swagger.** Run `scripts/generate-types.sh` to produce `src/integrations/umbraco/types.ts` via `openapi-typescript`. Per-block prop types are derived from those.

## Phased workflow (step-by-step, with review after each phase)

| Phase | Goal |
| --- | --- |
| 0 | Collect inputs (see `references/phase-0-checklist.md`) |
| 1 | Typed API client + server-fn proxy + debug route |
| 2 | Design system (fonts, color tokens, site header/footer shell) |
| 3 | Dynamic block rendering — registry + Block List/Grid renderers + all block components |
| 4 | Navigation, global content (header/footer from CMS), polish |
| 5 | Forms (deferred — usually posted back to Umbraco) |

After each phase, hand back to the user for review before starting the next. Full per-phase detail in `references/phased-workflow.md`.

## Reference map

- `references/phase-0-checklist.md` — exact intake before any code.
- `references/phased-workflow.md` — what each phase produces and its review checkpoint.
- `references/server-fn-proxy.md` — canonical server-fn shape for Umbraco calls.
- `references/block-registry.md` — alias→component registry, renderers, fallback, supporting renderers.
- `scripts/generate-types.sh` — regenerate Delivery API TypeScript types.
