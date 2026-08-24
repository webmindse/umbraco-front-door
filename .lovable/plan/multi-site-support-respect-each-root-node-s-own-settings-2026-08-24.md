# Multi-site support: respect each root node's own settings

## The problem

The CMS can hold several root nodes of type `site` (e.g. the main site at `/` and "Sista Varvet" at `/sista-varvet/`). Today the frontend always loads **one** site node — the default root — and uses it for colours, logo, favicon, navigation, footer and the language picker. So pages under `/sista-varvet/` render with the main site's branding instead of their own (in this case Sista Varvet has all colour fields empty, which should fall back to the CSS defaults, not inherit the other site's palette).

Confirmed in code:
- `getSite` calls `/content/item/` with only a culture — that always resolves the default start item.
- `SiteShell` calls `siteQueryOptions(culture)`, so header, footer, theme, nav root and breadcrumbs all come from that single node.
- `__root.tsx` hardcodes `getSite({ culture: "sv" })` for the favicon.

## What changes

1. **Resolve the site from the current page, not from a global default.**
   Every content response carries `route.startItem.id` — the id of its own root node. `SiteShell` will resolve the site by that id (via the existing `getContentById`), so `/sista-varvet/sv/press/` loads the Sista Varvet site node.

2. **Culture detection becomes root-aware.**
   Today culture is "path starts with `/en`". Sista Varvet uses `/sista-varvet/sv/` and `/sista-varvet/en/`. Culture will be read from the resolved page's `cultures` map / route path segment instead of a hardcoded prefix, with `sv` as default.

3. **Language picker uses the current site's own cultures.**
   The "other language" node becomes the same root node fetched in the other culture, and the fallback links come from that node's `cultures` map (`/sista-varvet/en/`), not the main site's.

4. **Navigation, footer, breadcrumbs follow automatically** once the resolved site id is passed to `navQueryOptions` and the resolved site object to `SiteFooter` / `Breadcrumbs`.

5. **Theme falls back cleanly.** `SiteThemeStyle` already skips null/empty colour values, so a site with no colours defined renders with the stylesheet defaults — no bleed from another root.

6. **Favicon per site.** The root route's global favicon fetch is replaced by a favicon resolved from the site node that the current page belongs to, with the default root as fallback for pages that fail to resolve.

7. **Pages with no content (404 / error states).** `SiteShell` is also rendered without a current page. In that case the site is resolved by walking the URL's first path segment against the CMS, falling back to the default root node if nothing matches.

## Technical notes

- New/changed server functions in `src/lib/umbraco.functions.ts`: a `getSiteForPath`-style helper that resolves a root node from a path (or id) and culture; `getSite` stays for the default-root fallback.
- `src/components/site/site-data.ts`: `siteQueryOptions` keyed by `[culture, siteId]` instead of culture alone, so different roots are cached separately.
- `src/components/site/SiteShell.tsx`: derive `siteId` from `currentPage.route.startItem.id`, derive culture from the page route, then feed header/footer/theme/nav/breadcrumbs from the resolved node.
- `src/lib/culture.ts`: `inferCultureFromPath` handles a culture segment anywhere directly under a root path, not just a leading `/en`.
- `src/routes/__root.tsx`: favicon loader keeps the default-root fetch as fallback; the leaf routes supply the per-site favicon.
- No block components change.

## Out of scope

Cross-site navigation (a menu listing all root sites) — the header keeps showing only the current site's tree.
