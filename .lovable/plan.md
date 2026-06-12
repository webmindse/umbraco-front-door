# Plan: `cards` + `card` blocks

Build two new blocks. `cards` is a section wrapper (`title`, `text`, nested `cardsList`). `card` is the leaf, with `cardSettings` driving presentation. Follow the `*Settings` convention documented in the `umbraco-headless-frontend` skill.

## Files

### 1. `src/components/umbraco/blocks/Cards.tsx` (new)

Wrapper. Renders centered `title` (h2) + `text` (paragraph), then a `flex flex-wrap` row of `<Card>` children using each item's `settings.width` to drive `flex-basis`.

```ts
interface CardsContent {
  title?: string;
  text?: string;
  cardsList?: { items?: BlockItem[] };
}
```

Iterate `cardsList.items`, pass each item's `content.properties` and `settings.properties` down to `<Card>`. No `cardsSettings` in the current payload — leave a typed-but-empty `CardsSettings` interface for future extension.

### 2. `src/components/umbraco/blocks/Card.tsx` (new)

Leaf component. Reads both `content` and `settings`.

```ts
interface CardContent {
  heading?: string;
  text?: { markup?: string; blocks?: unknown[] } | string;
  image?: UmbracoMediaLike[];
  icon?: string | null;            // shape TBD; treat as string/null for now
  link?: UmbracoLinkPickerItem[] | null;
  buttonOne?: UmbracoLinkPickerItem[] | null;
  buttonOneColor?: ButtonColor;
  buttonTwo?: UmbracoLinkPickerItem[] | null;
  buttonTwoColor?: ButtonColor;
}

interface CardSettings {
  width?: "25%" | "33%" | "50%" | "100%" | string;
  boxed?: boolean;
  centerContent?: boolean;
  mediaLeft?: boolean;
  border?: boolean;
  preferIcon?: boolean;
}
```

Width handling: width applies on `md:` and up via inline `style={{ flexBasis }}`. On mobile, every card is full width. Map `"33%"` → `calc(33.3333% - gap)`; simpler: use `style={{ flexBasis: width }}` with `flex-grow-0` and a wrapping flex container with `gap-6`, and accept minor sub-pixel rounding (matches the reference).

Layout shape:

- **Default (image top)**: column layout. `<UmbracoImage>` on top (aspect-video, object-cover), then a content area with heading (h3), RichText, buttons row.
- **`mediaLeft: true`**: on `md:` and up, switch to a 2-column grid `grid-cols-[40%_1fr]` with image left, content right. On mobile, stack vertically (matches screenshot 4 caption "I mobil justeras layouten till vertikal").
- **`boxed: true`**: wrap card in `rounded-lg bg-card shadow-md` with inner padding. Default (not boxed): no panel; image flush, content padded only horizontally if needed. From screenshots, every variant looks "boxed-ish" — the un-boxed look in screenshot 2 is just `link`-wrapped without buttons. Implement faithfully: `boxed` adds bg + shadow, otherwise transparent.
- **`border: true`**: adds `border border-border` (combines with or replaces boxed shadow per CMS intent — additive is safe).
- **`centerContent: true`**: `text-center` + center buttons (`justify-center`).
- **`preferIcon: true`**: when an `icon` is present, render the icon in place of `image`. If `preferIcon` is true but no icon, fall back to image. Icon rendering: render the icon string inside a circular badge (`h-16 w-16 rounded-full bg-primary/10 text-primary grid place-items-center`); treat the value as a class/glyph name placeholder for now — we'll refine when we have a real icon payload.
- **`link` present**: entire card becomes a single `<UmbracoLink>` wrapper with hover affordance (`hover:shadow-lg transition`). Buttons inside a link would nest `<a>` tags — when `link` is set, suppress button rendering (matches "Cards med länkar" variant having no buttons).

Buttons: reuse the same `variantFor(color)` mapping pattern from `Hero.tsx`. Two buttons, rendered in a `mt-6 flex flex-wrap gap-3` row (or `justify-center` when `centerContent`).

### 3. `src/components/umbraco/blocks/registry.ts`

Register both:

```ts
import Cards from "./Cards";
import Card from "./Card";

export const blockRegistry: Record<string, BlockComponent> = {
  hero: Hero as BlockComponent,
  cards: Cards as BlockComponent,
  card: Card as BlockComponent,
};
```

(Registering `card` lets it be reused standalone if ever placed at top level. The `cards` wrapper renders its children directly, not through the registry, since `cardsList` is a nested block list and we want tight control over the flex container.)

### 4. Skill update (`.agents/skills/umbraco-headless-frontend`)

Copy active skill into draft, then in `references/block-registry.md`:

- Add a "Wrapper blocks with nested block lists" note using `cards`/`card` as the example: when a block has a nested `cardsList`, the wrapper component iterates `items` itself (passing `content.properties` + `settings.properties` to the child component) rather than delegating to `BlockListRenderer`, because the wrapper owns the flex/grid container.
- Extend the settings example to show width-as-flex-basis with mobile fallback.

Apply with `skills--apply_draft`.

## Out of scope

- Real icon library wiring (waiting for a real `icon` payload to confirm shape).
- `cardsSettings` (not in current payload).
- Animations / hover micro-interactions beyond a shadow lift on linked cards.

## Review checkpoint

`/sv/cards` should render all four variants:
1. **Exempel** — 3 boxed cards, image top, 33% width each.
2. **Cards med länkar** — 3 cards as full-card links, no buttons.
3. **Cards med knappar** — 2 cards (50% each), buttons rendered with color variants.
4. **Cards åt sidan** — mixed widths with `mediaLeft` on the first row (image left/text right), stacking vertically on mobile.
