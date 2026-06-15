## Phase 4 — Header, Footer, Navigation, Language Picker

### What we now know from the `site` JSON

`site` is the home/start node (`/sv/`, `/en/`). Its `properties` carry both the page's `content` blocks AND every global header/footer config we need:

- Header: `logoOnDark`, `logoOnLight`, `favicon`, `languageFlag`, `languageDisplayName`, `altTextForLanguageFlag`
- Footer: `footerLogo`, `copyrightText`, `mainNavigation` (items), `secondaryNavigationTitle`, `secondaryNavigation` (items), `contactInfoTitle`, `address`, `phone`, `eMail`
- Cultures: top-level `cultures` map → `{ sv: { path: "/sv/" }, en: { path: "/en/" } }` (used by language picker)
- Header nav is NOT a property — it's derived from the content tree by listing children of the site node and filtering on `page.hideInNavigation`.

Navigation items in `mainNavigation` / `secondaryNavigation` are `footerNavigationItem` blocks: `{ title?: string, link: [{ title, route?: { path }, url?, target?, linkType }] }`.

### Server-side: fetch site + nav tree (one call)

Add to `src/lib/umbraco.functions.ts`:

```
export const getSite = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ culture: z.string().optional() }).parse(data ?? {}),
  )
  .handler(({ data }) =>
    umbracoFetch<ContentItem>("/content/item/", { culture: data.culture })
      // root path resolves to site doc; alt: /content/item/?fetch=...
  );
```

For header nav children, use existing `getChildren(site.id)` (already exists). To avoid two waterfalls per route, add:

```
export const getNavigationTree = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ culture: z.string().optional() }).parse(data ?? {}))
  .handler(({ data }) =>
    umbracoFetch<ContentResponse>(
      "/content?fetch=children:" + START_OR_RESOLVED_ID + "&expand=properties[children]",
      { culture: data.culture },
    ),
  );
```

We'll fetch site doc + nav tree once per culture and cache via React Query (`["umbraco-site", culture]`). The catch-all route loader (`$.tsx`) and index loader already run server-side — they will additionally call `getSite` + `getNavigationTree` in parallel with the page fetch and store in `__root` loader context. Cleanest place: move the global fetch into `__root.tsx`'s loader, which fans out once per route activation.

### Culture inference

Add `src/lib/culture.ts`: `inferCultureFromPath(path)` → `"en"` if path starts with `/en`, else `"sv"`. Use it in the root loader to pick which culture to fetch for `getSite` and `getNavigationTree`. The `cultures` map on the site doc supplies the canonical paths for the flag picker target.

### Frontend: replace placeholder Header/Footer

Refactor:

- `src/components/site/SiteHeader.tsx` → takes `site` + `navItems` + `currentCulture` props.
  - Desktop (md+): logo (left), horizontal nav (right), flag picker (right of nav).
  - Mobile (< md): logo + hamburger. Sheet opens full-screen panel with drill-down behavior matching the screenshot:
    - Level 1: list of top-level pages, plus a flag toggle row at top/bottom.
    - Tap an item with children → slide to Level 2 showing a "← Tillbaka" back row + that branch's children.
    - Recursion depth supported (children of children). State held in a `stack: NavNode[]` array; "back" pops.
  - Implementation: build with shadcn `Sheet` + a small `<NavLevel items onDrill onBack />` component animated with `data-state` slide-in classes (`translate-x` transitions). No external lib.
- `src/components/site/SiteFooter.tsx` → two columns matching the screenshot:
  - Top row: `footerLogo` (left) above `copyrightText`; on the right, `mainNavigation` rendered as a flat row of links.
  - Bottom row: column 1 = `contactInfoTitle` + address (with `\n` → `<br/>`) + phone + email (icons: MapPin / Phone / Mail from lucide); column 2 = `secondaryNavigationTitle` + `secondaryNavigation` links.
  - Use existing `bg-background-secondary text-text-light` (matches the dark-mauve in screenshot).

### `hideInNavigation` filter

When building `navItems` from `getNavigationTree`, filter `items.filter(i => !i.properties.hideInNavigation && i.contentType === "page")`. Map each to `{ name, path: route.path, children: i.properties.children?.items ?? [] }`. If the API doesn't return grand-children with `expand`, defer level-2 fetch to a per-branch `getChildren` call triggered when the user drills in (acceptable for mobile; cache by id).

### Language picker

- Desktop: shows current `languageFlag` (from CURRENT site doc) as a button; clicking opens a small Popover listing other available cultures from `cultures` map — each rendered with its own flag (we'd need to fetch the other culture's site doc to get its flag). Simpler v1: render a single flag + label that toggles to the *other* culture's home (`cultures[otherCulture].path`). On v2 we can fetch both site docs in parallel from `__root` loader to show both flags.
- Mobile: same toggle row at top of the sheet.
- Use `altTextForLanguageFlag` as `alt`.
- Switch target: navigate to `cultures[otherCulture].path` on the CURRENT page when available. Page-level cultures map exists on every CMS node — we already see it on `site`. For other pages we read `cultures` off the current `page` data in route context. Fallback = other-culture home from `site.cultures`.

### Route wiring

- `__root.tsx`: add a `beforeLoad` or `loader` that runs `getSite` + `getNavigationTree` for the inferred culture in parallel, exposes them via `Route.useRouteContext()` or `Route.useLoaderData()`. `SiteShell` receives them as props from the root component and forwards to Header/Footer.
- Index (`/`) and catch-all `/$` keep their existing page fetch.

### Types

Extend `src/integrations/umbraco/types.ts`:

```
export interface CultureRoute { path: string; queryString: string | null; startItem: { id: string; path: string } }
export interface ContentItemWithCultures extends ContentItem { cultures: Record<string, CultureRoute> }
export interface NavLink { title: string; url?: string|null; route?: { path: string } | null; target?: string|null; linkType: string }
export interface FooterNavigationItem { title: string | null; link: NavLink[] }
```

No `any`. Keep all parsing client-safe (no `process.env` outside `.server.ts`).

### Out of scope (this phase)

- Building remaining blocks (Text, Media, etc).
- Per-route `<head>` updates beyond what already exists.
- Full i18n string extraction — we use Swedish strings directly from CMS (`contactInfoTitle`, `secondaryNavigationTitle`, `altTextForLanguageFlag`).

### Files to create / edit

Create:
- `src/lib/culture.ts`
- `src/components/site/LanguagePicker.tsx`
- `src/components/site/MobileNavSheet.tsx`
- `src/components/site/NavLevel.tsx`

Edit:
- `src/lib/umbraco.functions.ts` (+ `getSite`, `getNavigationTree`)
- `src/integrations/umbraco/types.ts`
- `src/routes/__root.tsx` (root loader for site + nav, pass to SiteShell)
- `src/components/site/SiteShell.tsx` (accept site/nav, forward)
- `src/components/site/SiteHeader.tsx` (full rewrite)
- `src/components/site/SiteFooter.tsx` (full rewrite)
