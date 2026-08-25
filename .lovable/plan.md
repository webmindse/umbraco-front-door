# Fix low-contrast "Till bloggen" button

## Diagnosis

Not a CMS colour issue. The block's `buttonColor` is `Transparent`, which maps to the shared `outline` button variant. That variant sets a light fill (`bg-background`, currently rgb(230,234,225)) but no text colour, so the text inherits the panel's white text — white on near-white. Measured in the live preview: button background rgb(230,234,225), text rgb(255,255,255).

## Fix

In `src/components/ui/button.tsx`, change the `outline` variant so it is genuinely transparent and inherits contrast from whatever surface it sits on:

- Replace `bg-background` with `bg-transparent`.
- Keep `border border-current/70` style contrast by using the inherited colour (`border-current/70`) so the outline matches the surrounding text on both light and dark panels.
- Hover: use a translucent fill of the current colour (e.g. `hover:bg-current/10`) instead of `hover:bg-accent hover:text-accent-foreground`, which also forced a light background.

This keeps all other variants and their CMS-driven colours untouched.

## Verification

- Check the "Till bloggen" CTA in the Latest From Feed block on `/sv/listningar` (green panel) — dark/white text should now contrast against a transparent fill.
- Spot-check outline buttons on light backgrounds (Dynamic Content Listing card "Läs mer") to confirm they still read correctly.
