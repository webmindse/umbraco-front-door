# Square Button Style Site-Wide

## Goal

Apply the non-rounded, rectangular button style from the Dynamic Content Listing block to every button in the site, while preserving the existing color variants.

## What changed in the previous turn

- The `Button` component sizes were bumped to `px-6 py-3` to match the DCL card CTA.
- The DCL card CTA was converted from a custom `<span>` to the `Button` component with `variant="outline"`.
- However, the `Button` component still carries `rounded-md` in its base styles, so the DCL CTA now has rounded corners — unlike the original reference style.

## Plan

1. **Update the shared `Button` component** in `src/components/ui/button.tsx`:
   - Remove `rounded-md` from the base class string.
   - Remove `rounded-md` from the `sm` and `lg` size variants.
   - Keep all variant colors unchanged (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`).
   - Keep the updated sizing (`px-6 py-3` default, proportional `sm`/`lg`).

2. **Verify `DynamicContentListing.tsx`**:
   - Confirm the card CTA (now a `Button` with `variant="outline"`) renders as a square-cornered button matching the original reference.

3. **Audit for stray button-like elements**:
   - Search for any remaining custom `<span>`/`<a>` styled as buttons (e.g. in `Cards.tsx`, `Hero.tsx`, other blocks).
   - Replace them with the `Button` component when appropriate so the site-wide form is consistent.

4. **Visual check**:
   - Verify the DCL block on `/sv/listningar` shows square buttons.
   - Spot-check other buttons (navigation CTA, LatestFromFeed CTA, card buttons, etc.) for the new square form.
