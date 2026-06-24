## Goal
Implement the missing `text` block using the chosen "Classic editorial" direction, honoring `textSettings` the same way `Accordion` does.

## Files
- **Create** `src/components/umbraco/blocks/Text.tsx`
- **Edit** `src/components/umbraco/blocks/registry.ts` — register `text: Text`

## Component shape
- Props: `content.textContent` (rich-text envelope `{ markup }` or string), `settings` (textSettings).
- Settings (mirrors Accordion):
  - `fullWidth` → outer max-width 100%
  - `containerWidth` → outer max-width (default `66%`)
  - `contentWidth` → inner max-width (default `100%`)
  - `backgroundColor`: `Primary` → `bg-brand-mauve-shadow text-text-light`; `Secondary` → `bg-brand-onyx text-text-light`; else transparent
  - `applyMarginAbove` / `applyMarginBelow` → `mt-12 md:mt-16` / `mb-12 md:mb-16` (default true)
  - `anchorId` → section id
- When a background color is set, apply `px-8 py-12 md:px-16 md:py-16` to the colored inner wrapper (matches the screenshot's generous padding).
- Render markup through `RichTextRenderer` with `prose` + (on dark bg) `prose-invert prose-headings:text-text-light prose-p:text-text-light/90 prose-strong:text-text-light prose-hr:border-text-light/30` — gives bold heading + thin light hr + light body, as in the selected direction.

## Out of scope
- No changes to other blocks, no new tokens, no font additions (Inter already in use via prose defaults).
