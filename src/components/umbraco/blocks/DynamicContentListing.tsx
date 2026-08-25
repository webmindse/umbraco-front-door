import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/integrations/umbraco/types";
import { inferCultureFromPath } from "@/lib/culture";
import { cn } from "@/lib/utils";

import {
  ListingCard,
  filterBySegmentTags,
  parseSortOrder,
  sortListingItems,
  sourceChildrenQueryOptions,
  type TagRef,
} from "./listing-shared";
import type { BlockComponentProps } from "./registry";

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
    const filtered = filterBySegmentTags(
      all,
      active.props.segmentTags,
      active.props.segmentMustContainTags,
    );
    const { key, dir } = parseSortOrder(active.props.segmentSortOrder);
    return sortListingItems(filtered, key ?? "title", dir);
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
