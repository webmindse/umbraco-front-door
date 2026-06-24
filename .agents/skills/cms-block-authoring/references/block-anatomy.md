# Block Anatomy

## Component shape

Every block is a React component whose props match `BlockComponentProps`:

```ts
interface BlockComponentProps<
  TContent extends JsonObject = JsonObject,
  TSettings extends JsonObject = JsonObject,
> {
  content: TContent;          // content.properties from the payload
  settings?: TSettings;       // settings.properties (may be undefined)
  block: BlockItem;           // full item — rarely needed
}
```

Narrow `content` / `settings` to a local interface at the top of the file —
do not annotate `BlockComponentProps` generics in the registry.

## Dispatch

`BlockListRenderer` and `BlockGridRenderer` look up `item.content.contentType`
in the registry and render the matching component. The editor controls order;
the renderer iterates `items` in array order.

Grid items may also carry `columnSpan`, `rowSpan`, and `areas` — the grid
renderer handles those wrapper concerns. A block component never needs to read
them.

## Registering a block

1. Create the component file under the blocks directory.
2. Add **one line** to the registry: `<alias>: <Component> as BlockComponent`.
3. Aliases are case-sensitive and must match `contentType` exactly.

Strict build rules:
- Do not register a block whose file does not exist (build fails).
- Do not import a block file that is not exported (build fails).
- Do not add `as BlockComponent` casts to unrelated values.

## `silentBlockAliases`

Some aliases appear inside Block Lists but are consumed elsewhere (e.g.
`footerNavigationItem` is read directly by `SiteFooter`). Add such aliases to
`silentBlockAliases` so they do not trigger the "Missing block" fallback.
Never add a real block alias here — it would silently disappear.

## Missing block fallback

If an alias is not in the registry and not silenced, `MissingBlock` renders a
visible warning with the alias and content. Keep it visible during development;
do not suppress it globally.
