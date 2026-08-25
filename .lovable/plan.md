# Dynamic Content Listing block

A new CMS block (`dynamicContentListing`) that lists pages from one or more
"segments", filtered by tags, with segment tabs, card grid, and load-more.

## What the editor gets

- Heading + rich text intro above the listing.
- One or more segments. When there is more than one, they render as a row of
  tab buttons (as in the reference screenshot); clicking a tab swaps the list.
  A single segment renders without tabs.
- Each segment lists the pages that live under its chosen **source** page.
- Tag filtering per segment:
  - No tags set -> every page under the source is listed.
  - `segmentTags` set -> a page is included if it has **any** of those tags (OR).
  - `segmentMustContainTags` set -> a page must have **all** of those tags
    (AND), applied on top of / instead of the OR set when present.
- Sorting per segment: date (using the page's listing sort date, falling back
  to create date) or alphabetical, ascending or descending.
- Items per page comes from the block settings (`itemsPerPage`). If a segment
  has more items, a "load more" button appends the next batch, unless the
  segment has `segmentHideLoadMoreButton` set.
- Cards use the page's listing image, name, short description, and a read-more
  button whose label comes from `readMoreButtonText`; the whole card links to
  the page.
- `showAsVerticalList` setting renders the items as full-width stacked rows
  instead of a grid; standard margin-above / margin-below settings respected.

## Verified CMS shapes

- Segment properties: `segmentName`, `segmentSource` (page item),
  `segmentTags`, `segmentMustContainTags`, `segmentHideLoadMoreButton`,
  `segmentSortOrder`.
- Pages under the source expose:
  `listingForDynamicContentTags` (array of tag items with id/name),
  `listingForDynamicContentShortDescription`,
  `listingForDynamicContentImage`, `listingForDynamicContentSortDate`.
- Block settings on `/sv/listningar`:
  `{ itemsPerPage: 6, applyMarginAbove, applyMarginBelow, showAsVerticalList }`.

## Technical notes

- New `src/components/umbraco/blocks/DynamicContentListing.tsx`, registered in
  `blocks/registry.ts` under alias `dynamicContentListing`.
- Data comes from the existing `getChildren` server function, wrapped in a
  `queryOptions` helper keyed by source id + culture, consumed with
  `useSuspenseQuery` (same pattern as `Feed`/`LatestFromFeed`). Filtering,
  sorting, and paging happen client-side on that response.
- Tag matching compares tag **ids**, not names.
- Segment tab state and the load-more count are local component state, reset
  when switching segments.
- Card visuals reuse the existing card treatment (image, heading, description,
  outline button) with semantic tokens only.
- Related alias `filteredDynamicContentListing` exists in the CMS but is out of
  scope for this change.
