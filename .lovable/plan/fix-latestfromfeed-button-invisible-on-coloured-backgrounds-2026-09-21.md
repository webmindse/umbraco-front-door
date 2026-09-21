# Fix: LatestFromFeed button invisible on coloured backgrounds

## Problem
The "Till bloggen" button renders with `variant="default"` → `bg-primary`, which is the same green the CMS assigns to the block background (`bg-background-primary`). Button and panel are the same colour, so only the text shows.

## Fix
Add an auto-contrast rule in `LatestFromFeed.tsx` (and apply the same helper to other blocks that place a button on a coloured panel):

- Block background **Primary** or **Secondary** → button becomes `outline` (transparent, current-contrast border/text) unless the CMS `buttonColor` explicitly picks a different colour.
- `buttonColor` set in the CMS still wins: Primary → default, Secondary → secondary, Transparent → outline.
- No background (None) → unchanged behaviour.

## Files
- `src/components/umbraco/blocks/LatestFromFeed.tsx` — pass block background into the variant resolver.
- Sweep other blocks with CMS-driven buttons on coloured panels (Cards, TextAndMedia, Hero, Map, Contacts) and apply the same rule where the same clash can occur.

## Result
"Till bloggen" shows as a visible outlined button on the green panel; on plain backgrounds it keeps the filled primary look.
