# Skill: `cms-block-authoring`

A standalone, reusable skill for authoring Umbraco Block List / Block Grid blocks. The core SKILL.md is stack-agnostic (Umbraco patterns: alias→component registry, settings shape, RTE handling, design-first workflow). Project-specific values (brand tokens, registry path, RichTextRenderer location) live in a separate reference file so the skill ports cleanly to another Umbraco + TanStack Start project — copy the directory across, edit one reference file.

This skill is distinct from the existing `umbraco-headless-frontend` skill, which covers the full phased project setup. `cms-block-authoring` zooms into Phase 3 work: "I want to add or modify one block."

## Files

```
.agents/skills/cms-block-authoring/
├── SKILL.md
└── references/
    ├── block-anatomy.md
    ├── settings-conventions.md
    ├── rich-text-checklist.md
    ├── design-workflow.md
    └── project-bindings.md
```

## SKILL.md (stack-agnostic core)

Frontmatter:
- `name: cms-block-authoring`
- `description: Author or modify an Umbraco Block List / Block Grid block component. Triggers on requests to add a new block, fix an existing block, or implement a block from a payload + screenshot.`

Body, kept short, points at the references:

1. **Intake** — require the sample block payload (`content.properties`, `settings.properties`) and either a reference screenshot or written spec. If neither, follow `design-workflow.md` to propose 2–3 visual directions via `design--create_directions` before coding.
2. **Anatomy** — read `block-anatomy.md` for the registry dispatch, `BlockComponentProps` shape, where to register, and the `silentBlockAliases` escape hatch.
3. **Settings** — read `settings-conventions.md` for the standard `textSettings`-style fields (`fullWidth`, `containerWidth`, `contentWidth`, `backgroundColor`, `applyMarginAbove/Below`, `anchorId`) and the canonical wrapper pattern.
4. **Rich text** — if the block renders an RTE field, follow `rich-text-checklist.md` exactly (typography plugin install, RichTextRenderer usage, prose classes, dark-bg invert set).
5. **Project bindings** — read `project-bindings.md` for the concrete token names, file paths, and component imports in *this* project.

## references/block-anatomy.md

- `BlockComponentProps<TContent, TSettings>` shape and how `BlockListRenderer` / `BlockGridRenderer` dispatch by `contentType` alias.
- Registry pattern: alias keys are case-sensitive, one line per block.
- `silentBlockAliases` for blocks consumed elsewhere (e.g. footer nav).
- Don't add a block component without registering it; don't register without the file existing (strict build).

## references/settings-conventions.md

The shared settings vocabulary used across blocks:
- `fullWidth: boolean` → outer `max-width: 100%`
- `containerWidth: string` → outer max-width (default `66%`)
- `contentWidth: string` → inner max-width (default `100%`)
- `backgroundColor: "None" | "Primary" | "Secondary"` → maps to brand tokens (see `project-bindings.md`)
- `applyMarginAbove` / `applyMarginBelow: boolean` (default true) → `mt-12 md:mt-16` / `mb-12 md:mb-16`
- `anchorId: string | null` → section `id`
- When `backgroundColor` is set, the colored wrapper gets `px-8 py-12 md:px-16 md:py-16`.

Includes a small canonical JSX skeleton showing the nested `<section> → colored wrapper → content` structure used by `Accordion` and `Text`.

## references/rich-text-checklist.md

Every block that renders an RTE field:

1. **Verify typography plugin** — check `package.json` for `@tailwindcss/typography` and `src/styles.css` for `@plugin "@tailwindcss/typography";`. If missing, install (`bun add -d @tailwindcss/typography`) and add the `@plugin` line. (Auto-install per user's preference.)
2. **Use the project's RichTextRenderer**, not raw `dangerouslySetInnerHTML` — it already rewrites relative `/media/...` URLs via `VITE_UMBRACO_PUBLIC_BASE_URL`.
3. **Standard prose classes** to apply via the renderer's `className`:
   - sizes: `prose-sm md:prose-base`, `prose-h1:text-3xl md:prose-h1:text-4xl`, `prose-h2:text-2xl md:prose-h2:text-3xl`, `prose-h3:text-xl md:prose-h3:text-2xl`
   - headings: `prose-headings:font-semibold prose-headings:tracking-tight`
   - links (always primary color so they're identifiable): `prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80`
   - on dark backgrounds add: `prose-invert prose-headings:text-text-light prose-p:text-text-light/90 prose-strong:text-text-light prose-hr:border-text-light/30 prose-figcaption:text-text-light/70`
4. **Never hardcode color utilities** (`text-white`, `bg-black`, `bg-[#...]`) — use semantic tokens.

## references/design-workflow.md

- Skip directions when the user has provided a screenshot, a Figma reference, a written spec, or a link to a live page. If the user provides a link to a live page, capture a screenshot of the referenced section for context.
- Otherwise: gather the lightweight block design spec (shape, size, alignment, padding, bg, margins) per the existing `mem://preferences/block-spec` rule, then call `design--create_directions` with 2–3 options before implementing.

## references/project-bindings.md

The only file that changes when reusing the skill in another project:
- Registry path: `src/components/umbraco/blocks/registry.ts`
- Renderers: `src/components/umbraco/{BlockListRenderer,BlockGridRenderer}.tsx`
- RichTextRenderer: `src/components/umbraco/RichTextRenderer.tsx`
- Brand background tokens: `Primary → bg-brand-mauve-shadow text-text-light`, `Secondary → bg-brand-onyx text-text-light`
- Media base URL env: `VITE_UMBRACO_PUBLIC_BASE_URL`
- Existing block exemplars to copy from: `Accordion.tsx` (settings handling), `Text.tsx` (RTE handling), `TextAndMedia.tsx` (heading sizes).

## Cross-project reuse (documented in SKILL.md footer)

To use this skill in another project on the same stack:
1. In the other project, ask the agent to copy `.workspace/skills/cms-block-authoring/` from this project (cross-project file reads are one-way: other → current).
2. Place it under `.agents/skills/cms-block-authoring/` in the destination.
3. Edit `references/project-bindings.md` with that project's paths/tokens.
4. Apply via `skills--apply_draft`.

## Out of scope

- No changes to existing block components.
- No changes to `RichTextRenderer` or the registry.
- Does not duplicate the `umbraco-headless-frontend` skill's Phase 0–2 setup (API client, types, design system) — this skill assumes those exist.
