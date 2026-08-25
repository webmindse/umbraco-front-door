# Filtered Dynamic Content Listing block

New CMS block `filteredDynamicContentListing` — a richer sibling of the existing
Dynamic Content Listing: same segment/tag model, plus filter groups, free-text
search, alphabet filter, sorting, grid/list toggle and a hit counter.

## What the editor gets

- Heading + rich text intro above the listing.
- One or more **filtered segments**. More than one renders as the tab row (same
  visual language as the current Dynamic Content Listing tabs); a single segment
  renders without tabs. Switching tab resets all active filters.
- Each segment lists the pages under `filteredSegmentSource`, pre-filtered by
  `filteredSegmentTags` (OR) and `filteredSegmentMustContainTags` (AND) exactly
  as in the Dynamic Content Listing block.
- **Filter groups** (`filteredSegmentFilterGroups`): each group has a heading and
  a set of filter tags, rendered as a collapsible panel in a left sidebar.
  - `collapsed: true` starts the group closed.
  - `displayFilterTagsAsRadioButtons: true` allows one selection in that group;
    otherwise checkboxes with multi-select.
  - Within a group, selected tags are OR-ed.
  - Between groups: OR by default, AND when
    `filteredSegmentUseAndBetweenFilterGroups` is true.
  - Hidden entirely when `filteredSegmentHideFilterSection` is true.
- **Search field** — free-text match on page name and short description. Hidden
  when `filteredSegmentHideFilterSearch` is true.
- **Alphabet buttons** A–Z plus Å Ä Ö, filtering on the first letter of the page
  name. Single-select, click again to clear.
- **Sort buttons** "Titel" and "Datum" — each click cycles ascending → descending
  → off; activating one clears the other. Starting state comes from
  `filteredSegmentSortOrder` (e.g. "Alphabetical Ascending", date variants).
  Hidden when `filteredSegmentHideSortOrderButtons` is true.
- **Clear filter** button resets search, alphabet, tag selections and sorting
  back to the segment defaults.
- **Grid / list toggle** — two icon buttons top right; initial mode from
  `filteredSegmentShowItemsAsGrid`.
- **Hit counter** — "Visar X av Y" showing currently rendered vs total matches.
- Pagination/load-more on `itemsPerPage` from block settings (default 6), same
  behaviour as the existing listing block.

## Layout

```text
[ tabs ]
--------------------------------------------------
[ search                                         ]
[ A B C D ... Å Ä Ö                              ]
[ Clear ] [ Titel ⇅ ] [ Datum ⇅ ]      [grid][list]
                                        Visar 3 av 5
[ filter group  ▾ ]   [ card ] [ card ]
  ☐ Lorem             [ card ] [ card ]
  ☐ Ipsum
[ filter group  ▾ ]
```

Sidebar collapses above the results on mobile.

## Technical notes

- New `src/components/umbraco/blocks/FilteredDynamicContentListing.tsx`,
  registered in `blocks/registry.ts` under `filteredDynamicContentListing`.
- Data uses the existing `getChildren` server function via `useQueries`, one
  query per segment source, keyed by source id + culture — identical to
  `DynamicContentListing`.
- Card rendering, tag labels, date display and the "Läs mer" button are shared:
  the card markup is extracted from `DynamicContentListing.tsx` into a small
  shared `ListingCard` module so both blocks stay in sync, with a `variant`
  prop for grid vs list row.
- Tag matching compares tag **ids**.
- All filter/sort/view state is local component state, reset on segment change
  and by the clear button.
- Labels follow the page culture (Swedish default: "Sök...", "Rensa filter",
  "Titel", "Datum", "Visar X av Y", "Ladda fler").
- `filterGroup` and `filteredSegment` aliases are consumed inside this block, so
  they are added to `silentBlockAliases` to avoid Missing block warnings.
- Semantic tokens only; square button style as established site-wide.
