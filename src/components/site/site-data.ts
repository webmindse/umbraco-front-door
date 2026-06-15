import { queryOptions } from "@tanstack/react-query";

import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";
import { getNavigationDescendants, getSite } from "@/lib/umbraco.functions";
import type { Culture } from "@/lib/culture";

type SiteFetcher = (args: { data: { culture: Culture } }) => Promise<ContentItem>;
type NavFetcher = (args: {
  data: { rootId: string; culture: Culture };
}) => Promise<ContentResponse>;

export function siteQueryOptions(culture: Culture, fetcher?: SiteFetcher) {
  return queryOptions({
    queryKey: ["umbraco-site", culture] as const,
    queryFn: () =>
      (fetcher ?? (getSite as unknown as SiteFetcher))({ data: { culture } }),
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
