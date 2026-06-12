# Plan: Handle block `*Settings` — Hero first, document the pattern

## Goal

Make Hero actually read its `heroSettings` (height slider, backgroundColor toggle) and establish the per-block settings pattern. Subsequent blocks will follow the same shape as they're built.

## Scope

- **In scope:** Hero settings wiring; settings typing convention; skill docs update.
- **Out of scope:** Settings for other blocks (handled when each block is built).

## Changes

### 1. Type the settings shape (`src/components/umbraco/blocks/Hero.tsx`)

Add a `HeroSettings` interface alongside `HeroContent`:

```ts
interface HeroSettings {
  height?: number;        // 0–100, viewport %
  backgroundColor?: boolean;
}
```

Destructure `settings` from `BlockComponentProps` and cast: `const { height, backgroundColor } = (settings ?? {}) as unknown as HeroSettings;`.

### 2. Apply `height` as viewport %

- Replace the hardcoded `min-h-[80vh]` on the `<section>` with `style={{ minHeight: `${height ?? 80}vh` }}` (keep 80 as the fallback so behavior is unchanged when no settings are set).
- Same minHeight applied to the inner flex container that currently uses `min-h-[80vh]`.

### 3. Apply `backgroundColor` as a tinted panel behind text

When `backgroundColor === true`, wrap the existing inner content column (preHeading + h1 + RichText + buttons) in a panel:

```tsx
<div className={backgroundColor ? "rounded-lg bg-background-secondary/80 backdrop-blur-sm p-8 md:p-12" : ""}>
  {/* existing pre-heading, heading, text, buttons */}
</div>
```

The image, dark overlay, and scrollIcon stay outside the panel. When false, no wrapper styling is applied — current layout is preserved.

### 4. Update the skill (`.agents/skills/umbraco-headless-frontend/`)

Copy the active skill into the draft directory, then:

- **`references/block-registry.md`** — add a "Settings blocks" section documenting:
  - Convention: each block alias `foo` may have a sibling element type `fooSettings` that Umbraco attaches as `item.settings`.
  - `BlockListRenderer` already forwards `settings.properties` as the `settings` prop — no plumbing changes needed per block.
  - Pattern: declare a `FooSettings` interface in the same file as the block, destructure with sensible fallbacks, apply to styling (not content).
  - Show the Hero example (height → minHeight vh, backgroundColor → tinted panel) as the canonical reference.
- **`references/phased-workflow.md`** — under Phase 3 deliverables, add: "For each block, also handle its `*Settings` sibling if present (typed + applied to presentation only)."
- Apply the draft with `skills--apply_draft`.

## Out of scope

- Settings for other blocks (richText, cardGrid, etc.) — applied per-block in future turns.
- Changing the `BlockComponentProps` type signature — already correct.
- Any Umbraco-side schema changes.

## Review checkpoint

After implementation: toggle `backgroundColor` and adjust `height` in Umbraco backoffice, refresh preview, confirm both apply without breaking the existing hero layout when settings are absent.
