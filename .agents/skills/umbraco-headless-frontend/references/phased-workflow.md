# Phased workflow

Each phase produces a reviewable artifact. Hand back to the user after each phase before starting the next.

## Phase 1 — Typed API client + server-fn proxy

Deliverables:
- `src/integrations/umbraco/types.ts` — generated via `scripts/generate-types.sh` from the Delivery API swagger (`${UMBRACO_BASE_URL}/umbraco/delivery/api/v2/swagger.json`) using `openapi-typescript`. If swagger isn't exposed on the instance, hand-roll a minimal types file covering the shapes the app consumes.
- `src/integrations/umbraco/client.server.ts` — a thin `fetch` wrapper that injects the `Api-Key` header from `process.env.UMBRACO_API_KEY` and optional `Start-Item` / `Accept-Language` headers. Server-only.
- `src/lib/umbraco.functions.ts` — `createServerFn` exports: `getContentByRoute({ path })`, `getContentById({ id })`, `getChildren({ id })`, `getByContentType({ contentType })`. See `server-fn-proxy.md`.
- `src/routes/api/_debug.umbraco.tsx` (or a temporary debug page) — fetches a known route and dumps JSON. Used to confirm connectivity before Phase 2.

Review checkpoint: user hits the debug route, sees real Umbraco JSON, confirms the API key is working and types compile.

## Phase 2 — Design system + site shell

Deliverables:
- Google fonts imported in `src/styles.css`.
- Color tokens defined as CSS variables (oklch preferred) in `:root` and `.dark`.
- `<SiteHeader />` and `<SiteFooter />` shells (static for now; CMS-driven in Phase 4).
- Updated `src/routes/__root.tsx` / `src/routes/index.tsx` showing the styled shell with a placeholder home.
- A short typography + color sample on the landing route so the user can sanity-check fonts and contrast.

Review checkpoint: user looks at the preview and approves the visual baseline.

## Phase 3 — Dynamic block rendering

The core of the build. Deliverables:
- `src/components/umbraco/blocks/registry.ts` — `Record<string, ComponentType<{ content: BlockContent }>>` keyed by `contentType` alias.
- `src/components/umbraco/BlockListRenderer.tsx` and `BlockGridRenderer.tsx` — iterate the editor-ordered array, look up each block's `contentType`, render the matching component. Unknown alias → dev-only `<MissingBlock alias={...} />` fallback (returns `null` in production).
- One file per block alias under `src/components/umbraco/blocks/` (e.g. `Hero.tsx`, `Accordion.tsx`, `Cards.tsx`, etc.). Stub them first with a labelled placeholder, then implement each.
- Supporting renderers in `src/components/umbraco/`:
  - `<RichTextRenderer />` — renders Umbraco rich-text JSON safely.
  - `<UmbracoLink />` — handles internal/external/media link types from Umbraco's link picker.
  - `<UmbracoImage />` — resolves relative media URLs against `VITE_UMBRACO_PUBLIC_BASE_URL` (NOT the server-only `UMBRACO_BASE_URL`), applies `width`/`height`/`focal point` query params, lazy-loads.
- A dynamic catch-all route (`src/routes/$.tsx`) that calls `getContentByRoute` with the splat path, then renders the page's block list/grid.

**Build incrementally — one block at a time**, with a review checkpoint after each block (or small batch). The user should see each block rendered against real content before moving on.

For each block, also handle its `*Settings` sibling element type if present (e.g. `heroSettings` for `hero`). Type the settings shape, destructure with fallbacks that preserve pre-settings layout, and apply to presentation only (height, background, alignment, theme variant). See `block-registry.md` → "Settings blocks" for the canonical pattern.

Review checkpoint at end of Phase 3: every URL in the Umbraco content tree resolves to a styled page; every block in the catalog renders in editor-defined order; adding a new block in Umbraco requires one new file + one registry line on the frontend.

## Phase 4 — Navigation + global content + polish

Deliverables:
- Site nav driven by an Umbraco navigation node (or by the content tree under root).
- Header/footer content loaded from CMS (logo, footer links, social, legal).
- SEO metadata wired into `head()` of each route from Umbraco `seoMetaDescription` / `title` / `openGraph` fields.
- 404 and error pages styled.
- Sitemap and `robots.txt` if requested.

Review checkpoint: user clicks through the live site, confirms nav, metadata, and 404 behave correctly.

## Phase 5 — Forms (deferred)

When the user is ready, build forms that POST back to Umbraco (e.g. Umbraco Forms Delivery API, or custom endpoints exposed by the CMS). Out of scope for this skill's initial pattern; revisit and extend the skill once the form-handling approach is settled.
