# Phase 0 — Intake checklist

Do not write code until every item below is collected. Ask the user for anything missing.

## Required from the user

1. **`UMBRACO_BASE_URL`** — e.g. `https://cms.example.com`. No trailing slash. The Delivery API lives at `${BASE_URL}/umbraco/delivery/api/v2/`.
2. **`UMBRACO_API_KEY`** — store via the secrets tool, never in the codebase. Read only inside `createServerFn` handlers via `process.env.UMBRACO_API_KEY`.
3. **Content type aliases** — the full list, split into:
   - **Page types** (document types that map to URLs)
   - **Block types** (element types used inside Block List / Block Grid)
   For each block alias, note whether it's used in Block List, Block Grid, or both.
4. **Google font name(s)** — exact family names so they can be added to `src/styles.css` via `@import url("https://fonts.googleapis.com/...")`.
5. **Color tokens** — hex or oklch values, with semantic names (primary, background, foreground, accent, muted, etc.). Will be written to `src/styles.css` as CSS variables.
6. **Screenshots of the current GUI** — at minimum: home, an inner page, header, footer. Used to inform the design pass in Phase 2.

## Optional / decide with the user

- **Preview vs published API** — default to published. Preview requires the `Preview` header and is usually only wired up for an `_authenticated/` preview route.
- **Culture / language** — single-culture sites can omit; multi-culture sites pass `?culture=xx-XX` to every Delivery API call.
- **`start-item`** — for multi-site installations. Passed as the `Start-Item` header.
- **Media base URL** — usually the same as `UMBRACO_BASE_URL`. Used by `<UmbracoImage />` to resolve relative media URLs.

## Secrets to register

Use the secrets tool (do not commit to code):
- `UMBRACO_API_KEY`

`UMBRACO_BASE_URL` is not secret and can live in `.env` / `process.env` as plain config, or be hardcoded in `src/integrations/umbraco/config.server.ts` if it never changes per environment.

## Output of Phase 0

A short written summary, posted back to the user, listing:
- the base URL,
- confirmation the API key is stored,
- the alias inventory (page types, block types — both lists),
- the chosen fonts and color tokens,
- which screenshots were received.

User reviews and approves before Phase 1 starts.
