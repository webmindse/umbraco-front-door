import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { queryOptions, useQueries } from "@tanstack/react-query";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { Button } from "@/components/ui/button";
import { getChildren } from "@/lib/umbraco.functions";
import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";
import { inferCultureFromPath, type Culture } from "@/lib/culture";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

type ChildrenFetcher = (args: {
  data: { id: string; culture: Culture };
}) => Promise<ContentResponse>;

function sourceChildrenQueryOptions(sourceId: string, culture: Culture) {
  return queryOptions({
    queryKey: ["umbraco-dcl-children", sourceId, culture] as const,
    queryFn: () =>
      (getChildren as unknown as ChildrenFetcher)({ data: { id: sourceId, culture } }),
    staleTime: 60_000,
  });
}

interface TagRef {
  id?: string;
  name?: string;
}

interface SegmentProps {
  segmentName?: string | null;
  segmentSource?: ContentItem[] | null;
  segmentTags?: TagRef[] | null;
  segmentMustContainTags?: TagRef[] | null;
  segmentHideLoadMoreButton?: boolean | null;
  segmentSortOrder?: string | null;
}

interface SegmentBlockItem {
  content: { id: string; contentType: string; properties: unknown };
  settings?: unknown;
}

interface DclContent {
  heading?: string | null;
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  segments?: { items?: SegmentBlockItem[] } | null;
  readMoreButtonText?: string | null;
}

interface DclSettings {
  itemsPerPage?: number | string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  showAsVerticalList?: boolean | null;
  anchorId?: string | null;
}

interface ListingPageProps {
  listingForDynamicContentTags?: TagRef[] | null;
  listingForDynamicContentShortDescription?: string | null;
  listingForDynamicContentImage?: UmbracoMediaLike[] | null;
  listingForDynamicContentSortDate?: string | null;
}

function tagIds(tags: TagRef[] | null | undefined): string[] {
  return (tags ?? []).map((t) => t.id).filter((id): id is string => Boolean(id));
}

function sortItems(items: ContentItem[], order: string | null | undefined) {
  const o = (order ?? "").toLowerCase();
  const desc = o.includes("descending");
  const byDate = o.includes("date");
  const sorted = [...items].sort((a, b) => {
    if (byDate) {
      const pa = a.properties as unknown as ListingPageProps;
      const pb = b.properties as unknown as ListingPageProps;
      const da = new Date(
        pa?.listingForDynamicContentSortDate ?? a.createDate,
      ).getTime();
      const db = new Date(
        pb?.listingForDynamicContentSortDate ?? b.createDate,
      ).getTime();
      return da - db;
    }
    return a.name.localeCompare(b.name, "sv");
  });
  return desc ? sorted.reverse() : sorted;
}

function filterItems(items: ContentItem[], segment: SegmentProps) {
  const anyIds = tagIds(segment.segmentTags);
  const allIds = tagIds(segment.segmentMustContainTags);
  if (!anyIds.length && !allIds.length) return items;

  return items.filter((item) => {
    const own = tagIds(
      (item.properties as unknown as ListingPageProps)
        ?.listingForDynamicContentTags,
    );
    if (allIds.length && !allIds.every((id) => own.includes(id))) return false;
    if (anyIds.length && !anyIds.some((id) => own.includes(id))) return false;
    return true;
  });
}

function ListingCard({
  item,
  buttonText,
  horizontal,
}: {
  item: ContentItem;
  buttonText: string;
  horizontal: boolean;
}) {
  const p = (item.properties ?? {}) as unknown as ListingPageProps;
  const media = p.listingForDynamicContentImage?.[0];
  const href = item.route?.path ?? "/";

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
        <h3 className="font-display text-2xl tracking-tight">{item.name}</h3>
        {p.listingForDynamicContentShortDescription ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {p.listingForDynamicContentShortDescription}
          </p>
        ) : null}
        <div className="mt-auto flex pt-6">
          <span className="inline-flex items-center border border-foreground/70 px-6 py-3 text-sm transition group-hover:bg-muted">
            {buttonText}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function DynamicContentListing({
  content,
  settings,
}: BlockComponentProps) {
  const { heading, text, segments, readMoreButtonText } =
    content as unknown as DclContent;
  const s = (settings ?? {}) as unknown as DclSettings;

  const perPage = Number(s.itemsPerPage ?? 6) || 6;
  const vertical = s.showAsVerticalList === true;
  const buttonText = readMoreButtonText ?? "Läs mer";

  const segmentList = useMemo(
    () =>
      (segments?.items ?? []).map((item) => ({
        id: item.content.id,
        props: (item.content.properties ?? {}) as unknown as SegmentProps,
      })),
    [segments],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(perPage);

  const active = segmentList[activeIndex];
  const source = active?.props.segmentSource?.[0];
  const culture = inferCultureFromPath(source?.route?.path ?? "/");

  const results = useQueries({
    queries: segmentList.map((seg) => {
      const src = seg.props.segmentSource?.[0];
      const c = inferCultureFromPath(src?.route?.path ?? "/");
      return {
        ...sourceChildrenQueryOptions(src?.id ?? "none", c),
        enabled: Boolean(src?.id),
      };
    }),
  });

  const data = results[activeIndex]?.data;
  const isLoading = results[activeIndex]?.isLoading ?? false;

  const items = useMemo(() => {
    if (!active || !data) return [] as ContentItem[];
    const all = (data.items ?? []).filter((i) => i.contentType === "page");
    return sortItems(filterItems(all, active.props), active.props.segmentSortOrder);
  }, [active, data]);

  const shown = items.slice(0, visible);
  const canLoadMore =
    items.length > visible && active?.props.segmentHideLoadMoreButton !== true;

  function selectSegment(index: number) {
    setActiveIndex(index);
    setVisible(perPage);
  }

  if (!segmentList.length) return null;

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        "w-full px-6 md:px-12",
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
      )}
    >
      <div className="mx-auto max-w-6xl">
        {heading || text ? (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {heading ? (
              <h2 className="font-display text-3xl tracking-tight md:text-4xl">
                {heading}
              </h2>
            ) : null}
            {text ? (
              <RichTextRenderer value={text} className="prose-sm md:prose-base mt-4" />
            ) : null}
          </div>
        ) : null}

        {segmentList.length > 1 ? (
          <div
            className="mb-12 flex flex-wrap justify-center gap-3"
            role="tablist"
            aria-label={heading ?? "Segments"}
          >
            {segmentList.map((seg, i) => (
              <button
                key={seg.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                onClick={() => selectSegment(i)}
                className={cn(
                  "px-10 py-6 text-sm font-semibold transition",
                  i === activeIndex
                    ? "bg-background-primary text-background-primary-contrast"
                    : "bg-background-secondary text-background-secondary-contrast opacity-70 hover:opacity-100",
                )}
              >
                {seg.props.segmentName ?? `Segment ${i + 1}`}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">…</p>
        ) : shown.length ? (
          <div
            className={cn(
              "grid gap-8",
              vertical ? "grid-cols-1" : "sm:grid-cols-2",
            )}
          >
            {shown.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                buttonText={buttonText}
                horizontal={vertical}
              />
            ))}
          </div>
        ) : null}

        {canLoadMore ? (
          <div className="mt-12 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setVisible((v) => v + perPage)}
            >
              {culture === "en" ? "Load more" : "Ladda fler"}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
