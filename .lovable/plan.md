## Goal

Add a second, fully separated brand (theme + components) that activates when the Umbraco site setting `useAlternativeTheme` is true. The current ("default") brand stays untouched. Content structure, blocks, routing, and data layer remain shared.

## Approach: themed tokens + per-brand block variants

- One CSS file per brand defining tokens (colors, fonts, radii, shadows, spacing scale tweaks).
- One set of "shell" components per brand (SiteHeader, SiteFooter, page wrappers).
- One block registry per brand. Blocks that look the same can be shared; blocks that need different layout/composition get a brand-specific variant.
- A `BrandProvider` reads `site.properties.useAlternativeTheme`, sets `data-brand="default" | "alt"` on `<html>`, and exposes the active brand via context so the block dispatcher picks the right registry.

## Folder layout

```text
src/
  brands/
    index.ts                 // BrandProvider, useBrand, brand types
    default/
      theme.css              // current tokens (extracted from src/styles.css)
      fonts.ts               // link tags for Fira Sans
      shell/
        SiteHeader.tsx       // moved from src/components/site/
        SiteFooter.tsx
      blocks/
        registry.ts          // current registry
        // brand-specific overrides live here; shared blocks re-export
    alt/
      theme.css              // new tokens: #FFB997 #F67E7D #843B62 #0B032D, Space Grotesk/DM Sans
      fonts.ts               // link tags for Space Grotesk + DM Sans
      shell/
        SiteHeader.tsx       // alt layout
        SiteFooter.tsx
      blocks/
        registry.ts          // alt registry
        Hero.tsx, Cards.tsx, ... // alt variants where they need to differ
  components/
    umbraco/
      blocks/_shared/        // blocks that are identical across brands (start here)
      BlockListRenderer.tsx  // reads registry from useBrand()
      BlockGridRenderer.tsx
  styles.css                 // imports tailwindcss + both brand themes scoped by [data-brand]
```

Existing `src/components/site/*` and `src/components/umbraco/blocks/*` move into `brands/default/`. The shared renderers (`BlockListRenderer`, `BlockGridRenderer`, `PageRenderer`, `RichTextRenderer`, `UmbracoImage`, `UmbracoLink`) stay in `src/components/umbraco/` — they are brand-agnostic plumbing.

## Theme switching mechanics

`src/styles.css` keeps `@import "tailwindcss"` and `@theme inline` mappings, but the raw token values move to two scoped blocks:

```css
[data-brand="default"] { --brand-onyx: #141115; /* …current palette… */ }
[data-brand="alt"]     { --brand-bg: #0B032D; --brand-accent: #F67E7D; /* …alt palette… */ --font-sans: "Space Grotesk", …; --font-body: "DM Sans", …; }
```

`@theme inline` keeps referencing `var(--…)`, so every `bg-primary`, `text-foreground`, etc. flips automatically when `data-brand` changes — no component edits required for token-driven styling.

Fonts: the root route's `head()` conditionally adds the right Google Fonts `<link>` based on the active brand (or just loads both — small cost, simpler). Per stack rules, no `@import` of font URLs in CSS.

## BrandProvider + dispatcher

- `useBrand()` returns `'default' | 'alt'`, derived from `site.properties.useAlternativeTheme` resolved in `SiteShell` (which already has `site`).
- `SiteShell` writes `data-brand` to `document.documentElement` in an effect, and renders the brand-specific `<SiteHeader>` / `<SiteFooter>`.
- `BlockListRenderer` / `BlockGridRenderer` call `useBrand()` and look up the registry from `brands/<brand>/blocks/registry.ts`. Each registry can re-export shared block components or supply its own.

## Alt brand visual direction

- Palette: bg `#0B032D` (deep indigo near-black), surface `#1a0f3d`, accent `#F67E7D` (coral), highlight `#FFB997` (peach), text-on-dark `#FFB997`/white, mauve `#843B62` for secondary surfaces.
- Type: Space Grotesk for display/headings, DM Sans for body. Tighter tracking on headings, looser leading on body.
- Feel: editorial-modern, dark-mode-first, larger radii (`--radius: 1rem`), softer shadows with coral glow, more generous section padding than default.
- Shell: alt `SiteHeader` is dark indigo with coral underline accents; alt `SiteFooter` keeps the same data shape but in indigo/peach.

## Build phases

1. **Scaffold brand split**: create `src/brands/{default,alt}/`, move existing header/footer/blocks into `default/`, update imports, no visual change.
2. **Tokens + provider**: split `styles.css` into `data-brand`-scoped blocks, add `BrandProvider`/`useBrand`, wire `SiteShell` to set `data-brand` and pick the right shell, make `BlockListRenderer`/`BlockGridRenderer` brand-aware. Verify default brand looks identical.
3. **Alt theme**: write `brands/alt/theme.css` with the chosen palette + fonts, alt `SiteHeader`/`SiteFooter`, and alt block variants for Hero, Cards, TextAndMedia, Quote, Counters (others initially re-export default). Toggle `useAlternativeTheme` in CMS and verify.

Review checkpoint after each phase.

## Out of scope

- Changing content models, block aliases, routing, navigation data, or any business logic.
- Per-brand copy/content — the CMS content is the same.
- Dark-mode toggle behavior (separate concern from brand).
