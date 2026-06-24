# Settings Conventions

Most blocks share the same `settings` element type in Umbraco. The vocabulary
below maps each field to its expected effect. Honor every field a block's
settings type declares; ignore fields a block does not expose.

## Standard fields

| Field | Type | Effect |
| --- | --- | --- |
| `fullWidth` | `boolean` | When true, outer container `max-width: 100%`. |
| `containerWidth` | `string` (e.g. `"66%"`, `"100%"`) | Outer container max-width. Default `66%`. Ignored when `fullWidth` is true. |
| `contentWidth` | `string` (e.g. `"75%"`, `"100%"`) | Inner content max-width relative to the container. Default `100%`. |
| `backgroundColor` | `"None" \| "Primary" \| "Secondary"` | Maps to brand tokens — see `project-bindings.md`. |
| `applyMarginAbove` | `boolean` (default true) | `mt-12 md:mt-16` on the outer section. |
| `applyMarginBelow` | `boolean` (default true) | `mb-12 md:mb-16` on the outer section. |
| `anchorId` | `string \| null` | Sets `id` on the outer `<section>` for in-page anchors. |

## Canonical wrapper JSX

Use this skeleton for any block that honors the standard settings. The
colored wrapper gets generous padding only when a background color is set.

```tsx
<section
  id={s.anchorId ?? undefined}
  className={cn(
    "mx-auto px-6",
    s.applyMarginAbove !== false && "mt-12 md:mt-16",
    s.applyMarginBelow !== false && "mb-12 md:mb-16",
  )}
  style={s.fullWidth ? { maxWidth: "100%" } : { maxWidth: s.containerWidth ?? "66%" }}
>
  <div className={cn(wrap && "px-8 py-12 md:px-16 md:py-16", wrap)}>
    <div className="mx-auto" style={{ maxWidth: s.contentWidth ?? "100%" }}>
      {/* block content */}
    </div>
  </div>
</section>
```

`wrap` comes from a small helper that maps `backgroundColor` to the project's
brand tokens (see `project-bindings.md`) and also reports whether the
background is dark (used by the rich-text invert set).

## Rules

- Never hardcode color utilities (`text-white`, `bg-black`, `bg-[#...]`). Use
  semantic tokens defined in the project's `styles.css` / `@theme` block.
- When the block content is text-heavy, the inner content width default of
  `100%` is correct — the container width already constrains line length.
- Look at `Accordion.tsx` and `Text.tsx` as canonical settings-honoring
  exemplars before writing a new one.
