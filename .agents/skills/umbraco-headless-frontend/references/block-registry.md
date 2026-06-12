# Block registry pattern

Umbraco's Block List and Block Grid editors produce ordered arrays of blocks, each tagged with its element type's alias (`content.contentType`). The frontend renders them by dispatching alias → component through a registry.

## File layout

```text
src/components/umbraco/
├── BlockListRenderer.tsx
├── BlockGridRenderer.tsx
├── RichTextRenderer.tsx
├── UmbracoLink.tsx
├── UmbracoImage.tsx
└── blocks/
    ├── registry.ts
    ├── MissingBlock.tsx
    ├── Hero.tsx
    ├── Accordion.tsx
    ├── Cards.tsx
    └── ... (one file per alias)
```

## Registry

`src/components/umbraco/blocks/registry.ts`:

```ts
import type { ComponentType } from "react";
import Hero from "./Hero";
import Accordion from "./Accordion";
import Cards from "./Cards";
// ...one import per block

export interface BlockComponentProps<TContent = unknown, TSettings = unknown> {
  content: TContent;
  settings?: TSettings;
}

export const blockRegistry: Record<string, ComponentType<BlockComponentProps<any, any>>> = {
  hero: Hero,
  accordion: Accordion,
  cards: Cards,
  // ...one entry per alias
};
```

Keys are the exact `contentType` alias strings from Umbraco. Match is case-sensitive.

## Block List renderer

`src/components/umbraco/BlockListRenderer.tsx`:

```tsx
import { blockRegistry } from "./blocks/registry";
import MissingBlock from "./blocks/MissingBlock";

interface BlockItem {
  content: { id: string; contentType: string; properties: Record<string, unknown> };
  settings?: { id: string; contentType: string; properties: Record<string, unknown> };
}

export function BlockListRenderer({ items }: { items: BlockItem[] | undefined }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((item) => {
        const Component = blockRegistry[item.content.contentType];
        if (!Component) return <MissingBlock key={item.content.id} alias={item.content.contentType} />;
        return (
          <Component
            key={item.content.id}
            content={item.content.properties}
            settings={item.settings?.properties}
          />
        );
      })}
    </>
  );
}
```

## Block Grid renderer

Same dispatch logic, but wraps blocks in row/column/area layout primitives that respect the grid's `areas`, `columnSpan`, and `rowSpan` fields. Use CSS grid driven by those values; do not bake layout assumptions into individual block components.

## Fallback

`MissingBlock.tsx`:

```tsx
export default function MissingBlock({ alias }: { alias: string }) {
  if (import.meta.env.PROD) return null;
  return (
    <div className="rounded border border-dashed border-destructive p-4 text-sm text-destructive">
      Missing block component for alias: <code>{alias}</code>
    </div>
  );
}
```

Visible in dev so missing blocks are obvious. Silent in production so a missing implementation doesn't break the page.

## Supporting renderers

- **`<RichTextRenderer html={...} />`** — Umbraco returns rich text as either HTML string or a structured `markup` field. Render with `dangerouslySetInnerHTML` after sanitising (use `isomorphic-dompurify` if untrusted). Style via a `prose` wrapper.
- **`<UmbracoLink link={...}>{children}</UmbracoLink>`** — accepts Umbraco's link picker shape (`{ url, target, linkType: "Content" | "External" | "Media", ... }`). Internal links route through `<Link to={...} />`; external/media use a plain `<a>` with `target` and `rel="noopener"` when needed.
- **`<UmbracoImage media={...} width height />`** — accepts Umbraco's media picker shape. Resolves the `url` against `VITE_UMBRACO_PUBLIC_BASE_URL` if relative (NOT the server-only `UMBRACO_BASE_URL` — that's not in the client bundle), appends `?width=&height=&rmode=crop` and the focal point if present, sets `loading="lazy"`, and applies `alt` from the media item.

## Adding a new block

1. Editor adds a new element type alias in Umbraco (e.g. `testimonial`).
2. Create `src/components/umbraco/blocks/Testimonial.tsx`.
3. Add one line to `registry.ts`: `testimonial: Testimonial,`.

That's the whole change. No router updates, no schema migrations, no per-page wiring.

## Typing block props

Per-block prop shapes are derived from the generated Delivery API types in `src/integrations/umbraco/types.ts`. When the Delivery API exposes per-element-type schemas (Umbraco 14+), import them directly. Otherwise hand-write a small interface per block matching the properties the editor exposes, and refine over time.

Note: if `BlockComponentProps<TContent extends JsonObject>` is constrained to `JsonObject`, your per-block interface must satisfy the index signature — easiest is to drop the generic and cast `content as unknown as HeroContent` inside the component, or remove the `extends JsonObject` constraint on the registry's generic.
