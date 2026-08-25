# Navigation: fixes + three desktop redesign directions

## Part 1 — Fixes (apply regardless of chosen direction)

1. **Logo distortion at narrow widths**
   The logo sits in a flex row that shrinks it when the nav items need space. Fix: give the logo link `shrink-0`, set the image to `h-9 w-auto max-w-[180px] object-contain`, and let the nav list be the flexible column (`min-w-0`) instead of the logo. The header row becomes `grid-cols-[auto_minmax(0,1fr)_auto]` so logo and language picker keep their intrinsic size and only the nav area compresses.

2. **No more uppercase nav items**
   Remove `uppercase tracking-wider` from the primary nav list; use normal case with a slightly tighter weight/size (`text-[0.95rem] font-medium tracking-normal`).

3. **Respect Site colour settings everywhere in the nav**
   The dropdown panels currently hover with a hardcoded `hover:bg-white/5`, which ignores the CMS palette. Replace all hardcoded values with the nav tokens already injected from the `site` doc type: `--nav-background`, `--nav-foreground`, `--nav-secondary-background`, `--nav-secondary-foreground`. Hover states use `color-mix` against the secondary foreground so they work on both light and dark CMS palettes. Same for the mobile sheet and the language picker.

4. **Overflow safety**
   Even after the above, a long menu can outgrow the row. The nav switches to the mobile trigger at a higher breakpoint (`lg` instead of `md`), so the mid-range never squeezes the logo.

## Part 2 — Pick a desktop navigation direction

**A. Inline bar, refined (closest to today)**
One row: logo left, links centred, language picker right. Normal-case links, animated gradient underline kept, dropdowns as clean panels in the nav-secondary colour. Links that don't fit collapse into a "Mer" overflow menu instead of wrapping. Lowest risk, quickest.

**B. Two-tier header**
Thin top strip (language picker, optional utility links) over a main row with the logo left and the nav right. Gives each menu item more breathing room, so more items fit before overflow. Dropdowns become full-width mega-panels aligned to the header edges, with child pages in 2–3 columns.

**C. Compact bar + full-screen menu**
Header keeps only logo, one or two key links, language picker, and a "Menu" button. Clicking it opens a full-viewport overlay with all levels visible as columns — no hover dropdowns, no width pressure at all. Most editorial-modern; biggest change in behaviour.

## Technical notes
- Files touched: `src/components/site/SiteHeader.tsx`, `src/components/site/DesktopNavItem.tsx`, `src/components/site/MobileNavSheet.tsx`, `src/styles.css` (nav hover token), possibly a new overlay component for direction C.
- No data/loader changes; nav data and `hideInNavigation` filtering stay as-is.
