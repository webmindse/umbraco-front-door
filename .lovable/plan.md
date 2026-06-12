# Plan: Hero block component

Build the first real block component (`hero`) and wire it into the registry so the `/sv` page replaces its top "Missing block: hero" card with a rendered hero section.

## Files

**New: `src/components/umbraco/blocks/Hero.tsx`**

A typed block component matching the payload shape:

- `media: UmbracoMedia[]` — render first item as full-bleed background image via `<UmbracoImage>` (respect focal point, lazy=false for above-the-fold, fetchPriority="high").
- `preHeading: string` — small eyebrow text above the heading.
- `heading: string` + `animatedWords: string[]` — heading contains the literal token `#animatedWords`; split on that token and render a rotating word in its place (CSS-only fade/slide cycle through the array, ~2.5s per word). No JS animation library — simple `setInterval` + state.
- `text: { markup, blocks }` — render via existing `<RichTextRenderer>`.
- `buttonOne/Two/Three` — each is a single-item link picker array. Render via `<UmbracoLink>` wrapped in a shadcn `<Button>`. Map color to button variant:
  - `Primary` → `default` (uses `--primary`)
  - `Secondary` → `secondary` (uses `--secondary`)
  - `Transparent` → `outline` with transparent background
- `scrollIcon: boolean` — when true, render a chevron-down indicator at the bottom that scrolls one viewport down on click.

Layout: full-width section, min-height ~80vh, background image with dark overlay for contrast, content centered/left-aligned in a max-width container, Fira Sans, light text on dark overlay.

**Edit: `src/components/umbraco/blocks/registry.ts`**

Add one line:
```ts
import Hero from "./Hero";
// ...
export const blockRegistry = { hero: Hero, ... };
```

## Technical notes

- Hero typing: define a local `HeroContent` interface and use `BlockComponentProps<HeroContent>`.
- Animated word: a small `useAnimatedWord(words)` hook inside the file, no new deps.
- Buttons array may be empty — guard with `?.[0]`.
- Image: pass `width={1920}` to the CMS-side resizer through `UmbracoImage`; render at `object-cover` covering the section.
- Accessibility: `<h1>` for the heading (hero is typically the page H1), `aria-hidden` on the scroll chevron, `prefers-reduced-motion` disables the word cycling.

## Out of scope

Other block aliases (`cards`, `accordion`, etc.) — handled in subsequent batches once you confirm the hero looks right.
