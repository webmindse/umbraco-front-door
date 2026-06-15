## Fixes to `src/components/umbraco/blocks/TextAndMedia.tsx`

### 1. Video not loading (`/media/...` URL)
The `<video src={vid.url}>` and the YouTube/Vimeo branches use raw relative URLs. Images go through `UmbracoImage`, which prefixes `VITE_UMBRACO_PUBLIC_BASE_URL`; videos skip that step, so the browser requests `/media/...` from the preview origin and 404s.

- Export the existing URL resolver from `UmbracoImage.tsx` (rename internal `resolveUrl` → exported `resolveUmbracoMediaUrl`), or add a small shared helper in `src/integrations/umbraco/`.
- In `TextAndMedia`, wrap `vid.url` with that resolver before passing to `<video src=...>`.

### 2. "Behind" alignment — text contrast
Reference screenshot shows: media as background, an inset **cream card** (matches `--accent` / lavender-blush) with **dark text** and a primary button, no dark overlay tint.

Change the `alignment === "Behind"` branch:
- Remove `bg-black/40` overlay and `text-text-light`.
- Render `textNode` inside an inner card: `bg-accent text-accent-foreground rounded-lg p-8 md:p-12 max-w-2xl mx-auto` centered over the media.
- Keep media as the absolute-fill background (object-cover).

### 3. `applyBackgroundColor` — use `--background-secondary`
Reference screenshot shows a **dark mauve** panel with light text, a thin divider under the sub-heading, and full-bleed background spanning the section.

Currently the code applies `bg-muted` only to the inner `textNode` wrapper. Change to:
- When `applyBackgroundColor` is true, the **outer section** gets `bg-background-secondary text-text-light` (full-bleed feel) and the inner content uses generous vertical padding (`py-16 md:py-24`).
- Headings inside inherit light color (override the global `h1-h6 { color: var(--text-dark) }` rule with an explicit `text-text-light` on the heading when this flag is on).
- Remove the `bg-muted` styling on `textNode`.

This also means `applyBackgroundColor` should NOT also wrap the textNode — it's a section-level treatment.

### Out of scope
- No design-token changes in `styles.css`.
- No other block components touched.
- Registry untouched.

### Technical notes
- Resolver helper export keeps a single source of truth for CMS base URL handling between images and videos.
- `--background-secondary` is `--brand-mauve-shadow` in light theme (matches the dark mauve in the screenshot) and `--brand-mauve-shadow` again in dark — already correct.
- Heading color override: add `[&_h2]:text-text-light` to the section wrapper when `applyBackgroundColor` is set, since `src/styles.css` forces `color: var(--text-dark)` on `h1–h6` globally.
