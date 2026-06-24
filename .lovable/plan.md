## Goal
Get the Quote block's squircle variant to match the design screenshot, using a proper visual-direction loop instead of guessing from a single screenshot.

## Step 1 — Generate squircle design directions
Re-attach your earlier Quote design screenshot (the squircle reference) so I can call `design--create_directions` with it. I'll request 3 refined variants of just the squircle quote card, all locked to:

- Brand mauve-shadow background, light text
- Quote mark, quote text, author avatar, author name + title
- Centered content (both axes)
- Compact size (not the oversized blob we have now)
- Smoother, more subtle squircle radii than the current implementation

The three variants will differ in proportion, internal spacing, quote-mark treatment, and avatar placement — not in palette or content.

## Step 2 — You pick one
I'll present the 3 rendered options via `ask_questions` (prototype type). You click the one that matches.

## Step 3 — Implement the pick in `Quote.tsx`
Only the squircle branch changes:
- Replace the current `[border-radius:38%_42%...]` blob with the chosen direction's radii
- Replace `min(560px, 90vw)` + `aspectRatio: 1/1` with the chosen size/ratio
- Update padding, text alignment, and author block layout to match
- Standard (non-squircle) variant stays as-is

## Step 4 — Save a reusable "block spec" convention
Add a short memory at `mem://preferences/block-spec` describing the lightweight spec template we'll use for every future CMS block (shape, max size, alignment, padding, bg behavior, margins). Future block requests can drop a filled-in spec alongside the screenshot, which eliminates 90% of the guesswork that caused this drift.

No spec is needed for blocks already shipped unless you want to revisit them.

## Out of scope
- No changes to the registry, settings parsing, or the non-squircle Quote layout
- No changes to other blocks
- No backend / CMS schema changes