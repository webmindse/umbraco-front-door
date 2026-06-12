# Plan: Add media-URL gotcha to umbraco-headless-frontend skill

Capture the `VITE_UMBRACO_PUBLIC_BASE_URL` requirement so future runs of this skill don't repeat the broken-image debugging cycle.

## Steps

1. **Copy the active skill into a draft** at `.agents/skills/umbraco-headless-frontend/` (SKILL.md + all references). Drafts are the only safe place to edit.

2. **Edit `references/phase-0-checklist.md`** — add a bullet under env-var setup:
   > Set BOTH `UMBRACO_BASE_URL` (server, secret) AND `VITE_UMBRACO_PUBLIC_BASE_URL` (client, public) to the same origin. The `VITE_*` var is required so the browser can resolve relative `/media/...` URLs Umbraco returns in JSON.

3. **Edit `references/server-fn-proxy.md`** — add a short "Media URLs" subsection at the end:
   - Delivery API returns relative `/media/...` paths in image properties.
   - The server-fn never sees these as `<img>` requests — the browser does.
   - Therefore the public origin needs a separate `VITE_*` env var; do NOT try to reuse the server secret.
   - Symptom if missing: hero/card images 404 from the preview origin instead of the CMS host.
   - Note: `UmbracoImage` already reads `import.meta.env.VITE_UMBRACO_PUBLIC_BASE_URL` — no component changes needed once the env var is set.

4. **No SKILL.md changes** — the front-matter description still matches; this is just deeper reference content.

5. **Apply the draft** via `skills--apply_draft` with path `.agents/skills/umbraco-headless-frontend`.

## Out of scope

- No changes to the project itself (the `.env` fix already shipped).
- No rewrite of the phased workflow — only additive edits to two reference files.
