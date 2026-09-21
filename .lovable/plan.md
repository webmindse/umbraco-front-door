# Fix Section Navigation alignment

## What is happening

The supplied route contains four Section Navigation blocks:

- Unboxed, Primary background
- Boxed, Secondary background
- Boxed, no background
- Unboxed, bordered, no background

The current implementation applies the boxed width directly to the tab row and content panel separately. The tab row also has a full-width minimum, which overrides its boxed maximum; the panel is constrained correctly, so their edges no longer align.

The `None` background value also falls through to Primary styling, instead of remaining transparent. This affects the third and fourth examples.

## Changes

1. Introduce one shared inner wrapper for both the tab row and its content panel.
2. Apply the boxed maximum width to that wrapper, ensuring tabs and content always share the same left and right edges.
3. Keep unboxed blocks at the normal available width and preserve horizontal tab scrolling on smaller screens.
4. Handle `None` explicitly as a transparent panel with inherited page text color; keep Primary and Secondary mapped to their CMS theme colors.
5. Apply the selected background consistently to the active tab and panel, including the transparent `None` state.
6. Preserve the existing border option around the content panel only.

## Verification

- Check all four instances on `/sv/section-navigation` at desktop and mobile widths.
- Confirm boxed instances have perfectly aligned tabs and panels.
- Confirm `None` produces no colored panel, while Primary and Secondary retain correct contrast.
- Confirm tab switching and horizontal mobile scrolling still work.
- Confirm the project build remains successful.
