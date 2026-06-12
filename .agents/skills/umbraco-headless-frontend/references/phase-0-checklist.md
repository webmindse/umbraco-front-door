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

## Environment variables to write

Write BOTH of these to `.env` in Phase 0/1. Skipping the second one is the #1 cause of broken images in Phase 3:

- **`UMBRACO_BASE_URL`** — server-only. Read by `client.server.ts` for Delivery API calls. Not exposed to the browser.
- **`VITE_UMBRACO_PUBLIC_BASE_URL`** — client-bundled. Read by `<UmbracoImage>` (and any client code) via `import.meta.env.VITE_UMBRACO_PUBLIC_BASE_URL` to resolve relative `/media/...` URLs that Umbraco returns in JSON. Set this to the same origin as `UMBRACO_BASE_URL` unless media is served from a separate CDN host.

Both go in `.env` (no quotes, no trailing slash):

```
UMBRACO_BASE_URL=https://cms.example.com
VITE_UMBRACO_PUBLIC_BASE_URL=https://cms.example.com
```

After adding/changing the `VITE_*` var, restart the dev server so Vite picks it up.

## Secrets to register

Use the secrets tool (do not commit to code):
- `UMBRACO_API_KEY`

`UMBRACO_BASE_URL` and `VITE_UMBRACO_PUBLIC_BASE_URL` are not secrets (the public origin is visible in image `src` attributes regardless) and live in `.env`.

## Output of Phase 0

A short written summary, posted back to the user, listing:
- the base URL (and confirmation both env vars are set),
- confirmation the API key is stored,
- the alias inventory (page types, block types — both lists),
- the chosen fonts and color tokens,
- which screenshots were received.

User reviews and approves before Phase 1 starts.
