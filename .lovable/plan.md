# Plan: Draft `umbraco-headless-frontend` skill

Create a reusable, generalized skill that teaches a future agent how to build a TanStack Start frontend on top of any Umbraco 12+ Delivery API instance. Specifics (aliases, colors, fonts, base URL) are gathered fresh per project in Phase 0 — the skill teaches the *pattern*, not this project's values.

## Location

`.agents/skills/umbraco-headless-frontend/` (draft). Applied via `skills--apply_draft` once written.

## Files to create

```text
.agents/skills/umbraco-headless-frontend/
├── SKILL.md
├── references/
│   ├── phased-workflow.md
│   ├── server-fn-proxy.md
│   ├── block-registry.md
│   └── phase-0-checklist.md
└── scripts/
    └── generate-types.sh
```

### SKILL.md
YAML frontmatter:
- `name: umbraco-headless-frontend`
- `description:` one line — triggers when the user wants to build a frontend against an Umbraco headless / Delivery API backend, especially with Block List / Block Grid content.

Body: short overview, when to use, when NOT to use (non-Umbraco CMS, JSON-only API with no block model), and a navigation map pointing to the four reference files. Lists the phased workflow at a high level (Phase 0 inputs → Phase 1 typed client → Phase 2 design shell → Phase 3 dynamic block rendering → Phase 4 nav/globals/polish → Phase 5 forms deferred). Emphasises step-by-step build with review checkpoints.

### references/phase-0-checklist.md
The intake the agent must run before writing code:
- `UMBRACO_BASE_URL`, `UMBRACO_API_KEY` (stored as secrets, never in client)
- List of content type aliases (page types + block types)
- Google font name(s)
- Color tokens (hex/oklch)
- Screenshots of current GUI
- Preview/published API toggle, culture/language, optional `start-item`

### references/phased-workflow.md
Phase-by-phase generalised workflow with review checkpoints after each phase. Mirrors what we settled on for this project but written generically.

### references/server-fn-proxy.md
The architectural rule: all Umbraco calls go through `createServerFn`, API key read inside `.handler()` via `process.env`, never exposed to the browser. Includes a canonical example: `getContentByRoute`, `getContentById`, `getChildren`. Notes the auth-protected-server-functions caveats (only call from components or `_authenticated/` loaders).

### references/block-registry.md
The alias→component registry pattern:
- `src/components/umbraco/blocks/registry.ts` maps `contentType` string → React component
- `<BlockListRenderer />` and `<BlockGridRenderer />` iterate the editor-ordered array and dispatch via registry
- Unknown alias → dev-only `<MissingBlock>` fallback
- Adding a new block = one new file + one registry line
- Supporting renderers: `<RichTextRenderer />`, `<UmbracoLink />`, `<UmbracoImage />` (with media URL resolution)
- TypeScript: derive per-block prop types from generated Delivery API types

### scripts/generate-types.sh
Helper that runs `openapi-typescript` against `${UMBRACO_BASE_URL}/umbraco/delivery/api/v2/swagger.json` and writes `src/integrations/umbraco/types.ts`. Idempotent; safe to re-run when the schema changes.

## What this skill does NOT encode

- This project's specific aliases, colors, fonts, or base URL — those are Phase 0 inputs for each new project.
- Lovable Cloud, auth, or database wiring (Umbraco is the source of truth).
- Form handling — deferred (Phase 5) and project-specific.

## Hand-off

After writing all files, call `skills--apply_draft` with path `.agents/skills/umbraco-headless-frontend` to activate it. Future projects can then trigger it by name or by describing an Umbraco headless build.

## Note on timing

Drafting now captures the pattern before we start building. We can revise the skill after Phase 3 lands if the actual implementation reveals refinements — updating a skill is the same flow (edit draft, re-apply).
