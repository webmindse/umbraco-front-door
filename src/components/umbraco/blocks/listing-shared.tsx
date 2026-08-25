import { Link } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { Button } from "@/components/ui/button";
import { getChildren } from "@/lib/umbraco.functions";
import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";
import type { Culture } from "@/lib/culture";
import { cn } from "@/lib/utils";

type ChildrenFetcher = (args: {
  data: { id: string; culture: Culture };
}) => Promise<ContentResponse>;

export function sourceChildrenQueryOptions(sourceId: string, culture: Culture) {
  return queryOptions({
    queryKey: ["umbraco-dcl-children", sourceId, culture] as const,
    queryFn: () =>
      (getChildren as unknown as ChildrenFetcher)({ data: { id: sourceId, culture } }),
    staleTime: 60_000,
  });
}

export interface TagRef {
  id?: string;
  name?: string;
}

export interface ListingPageProps {
  listingForDynamicContentTags?: TagRef[] | null;
  listingForDynamicContentShortDescription?: string | null;
  listingForDynamicContentImage?: UmbracoMediaLike[] | null;
  listingForDynamicContentSortDate?: string | null;
}

export function pageProps(item: ContentItem): ListingPageProps {
  return (item.properties ?? {}) as unknown as ListingPageProps;
}

export function tagIds(tags: TagRef[] | null | undefined): string[] {
  return (tags ?? []).map((t) => t.id).filter((id): id is string => Boolean(id));
}

export function itemTagIds(item: ContentItem): string[] {
  return tagIds(pageProps(item).listingForDynamicContentTags);
}

export function itemDate(item: ContentItem): number {
  return new Date(
    pageProps(item).listingForDynamicContentSortDate ?? item.createDate,
  ).getTime();
}

/** Pre-filter by the segment's own OR (`tags`) / AND (`mustContainTags`) sets. */
export function filterBySegmentTags(
  items: ContentItem[],
  anyTags: TagRef[] | null | undefined,
  allTags: TagRef[] | null | undefined,
) {
  const anyIds = tagIds(anyTags);
  const allIds = tagIds(allTags);
  if (!anyIds.length && !allIds.length) return items;

  return items.filter((item) => {
    const own = itemTagIds(item);
    if (allIds.length && !allIds.every((id) => own.includes(id))) return false;
    if (anyIds.length && !anyIds.some((id) => own.includes(id))) return false;
    return true;
  });
}

export type SortKey = "title" | "date" | null;
export type SortDir = "asc" | "desc";

export function parseSortOrder(order: string | null | undefined): {
  key: SortKey;
  dir: SortDir;
} {
  const o = (order ?? "").toLowerCase();
  if (!o) return { key: null, dir: "asc" };
  return {
    key: o.includes("date") ? "date" : "title",
    dir: o.includes("descending") ? "desc" : "asc",
  };
}

export function sortListingItems(
  items: ContentItem[],
  key: SortKey,
  dir: SortDir,
): ContentItem[] {
  if (!key) return items;
  const sorted = [...items].sort((a, b) =>
    key === "date" ? itemDate(a) - itemDate(b) : a.name.localeCompare(b.name, "sv"),
  );
  return dir === "desc" ? sorted.reverse() : sorted;
}

export function formatListingDate(item: ContentItem): string {
  const raw = pageProps(item).listingForDynamicContentSortDate ?? item.createDate;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function ListingCard({
  item,
  buttonText,
  horizontal,
  showDate = false,
  showButton = true,
}: {
  item: ContentItem;
  buttonText: string;
  horizontal: boolean;
  showDate?: boolean;
  showButton?: boolean;
}) {
  const p = pageProps(item);
  const media = p.listingForDynamicContentImage?.[0];
  const tags = (p.listingForDynamicContentTags ?? []).filter((t) => t?.name);
  const href = item.route?.path ?? "/";
  const date = showDate ? formatListingDate(item) : "";

  return (
    <Link
      to={href}
      className={cn(
        "group flex h-full overflow-hidden bg-card text-card-foreground no-underline shadow-sm transition hover:shadow-lg",
        horizontal ? "flex-col md:flex-row" : "flex-col",
      )}
    >
      {media ? (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            horizontal ? "aspect-[3/2] md:aspect-auto md:w-2/5" : "aspect-[3/2]",
          )}
        >
          <UmbracoImage
            media={media}
            width={880}
            fill
            alt={media.name}
            className="transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6 md:p-8">
        {date ? (
          <p className="mb-2 text-right text-xs text-muted-foreground">{date}</p>
        ) : null}
        {tags.length ? (
          <ul className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag.id ?? tag.name}
                className="border border-foreground/20 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        ) : null}
        <h3 className="font-display text-2xl tracking-tight">{item.name}</h3>
        {p.listingForDynamicContentShortDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {p.listingForDynamicContentShortDescription}
          </p>
        ) : null}
        {showButton ? (
          <div className="mt-auto flex pt-6">
            <Button type="button" variant="outline" asChild size="default">
              <span>{buttonText}</span>
            </Button>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
