# Project Bindings

Project-specific paths, tokens, and exemplars. **This is the only file to
edit when porting the skill to another project.**

## File paths

- Block components: `src/components/umbraco/blocks/`
- Registry: `src/components/umbraco/blocks/registry.ts`
- Block List renderer: `src/components/umbraco/BlockListRenderer.tsx`
- Block Grid renderer: `src/components/umbraco/BlockGridRenderer.tsx`
- Rich text renderer: `src/components/umbraco/RichTextRenderer.tsx`
- Global styles (Tailwind v4 entry): `src/styles.css`

## Background color → token map

The `backgroundColor` setting maps as follows. Both Primary and Secondary
are dark, so they trigger the `prose-invert` set for rich text.

| Value | Tailwind classes | Dark? |
| --- | --- | --- |
| `Primary` | `bg-brand-mauve-shadow text-text-light` | yes |
| `Secondary` | `bg-brand-onyx text-text-light` | yes |
| `None` / other | _(transparent, no classes)_ | no |

## Environment

- `VITE_UMBRACO_PUBLIC_BASE_URL` — public base for the Umbraco media origin.
  Used by `RichTextRenderer` to absolutize `/media/...` URLs. Must be set in
  `.env` for media in RTE content to load.

## Exemplars to copy from

- `Accordion.tsx` — canonical settings handling (full set of standard fields).
- `Text.tsx` — canonical RTE block (prose classes, dark-bg invert set).
- `TextAndMedia.tsx` — heading sizes and two-column layout patterns.

## Silenced aliases (already handled elsewhere)

- `footerNavigationItem` — consumed by `SiteFooter`, not the block dispatcher.
