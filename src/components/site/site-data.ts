import { queryOptions } from "@tanstack/react-query";

import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";
import {
  getContentById,
  getNavigationDescendants,
  getSiteForPath,
} from "@/lib/umbraco.functions";
import type { Culture } from "@/lib/culture";
import { resolveUmbracoMediaUrl } from "@/components/umbraco/UmbracoImage";

type ByIdFetcher = (args: {
  data: { id: string; culture: Culture };
}) => Promise<ContentItem>;
type ByPathFetcher = (args: {
  data: { path: string; culture: Culture };
}) => Promise<ContentItem>;
type NavFetcher = (args: {
  data: { rootId: string; culture: Culture };
}) => Promise<ContentResponse>;

export interface SiteQuerySource {
  /** Root node id, when the current page already told us which site it belongs to. */
  siteId?: string | null;
  /** URL path, used to resolve the owning root when no page is available. */
  path?: string;
}

/**
 * Resolve the `site` root node for the current culture. Multi-root aware:
 * keyed by the resolved root id (or the path we resolve it from) so different
 * roots never share cached settings.
 */
export function siteQueryOptions(
  culture: Culture,
  source: SiteQuerySource = {},
  fetchers?: { byId?: ByIdFetcher; byPath?: ByPathFetcher },
) {
  const siteId = source.siteId ?? null;
  const path = source.path ?? "/";
  return queryOptions({
    queryKey: ["umbraco-site", culture, siteId ?? `path:${path}`] as const,
    queryFn: () => {
      if (siteId) {
        const byId = fetchers?.byId ?? (getContentById as unknown as ByIdFetcher);
        return byId({ data: { id: siteId, culture } });
      }
      const byPath = fetchers?.byPath ?? (getSiteForPath as unknown as ByPathFetcher);
      return byPath({ data: { path, culture } });
    },
    staleTime: 5 * 60_000,
  });
}

export function navQueryOptions(
  culture: Culture,
  rootId: string,
  fetcher?: NavFetcher,
) {
  return queryOptions({
    queryKey: ["umbraco-nav", culture, rootId] as const,
    queryFn: () =>
      (fetcher ?? (getNavigationDescendants as unknown as NavFetcher))({
        data: { rootId, culture },
      }),
    staleTime: 5 * 60_000,
    enabled: Boolean(rootId),
  });
}

/** Absolute URL for the site's favicon media item, when set. */
export function extractFaviconUrl(site: ContentItem | null | undefined): string | null {
  const favicon = (site?.properties?.favicon as Array<{ url?: string }> | undefined)?.[0];
  if (!favicon?.url) return null;
  return resolveUmbracoMediaUrl(favicon.url);
}
