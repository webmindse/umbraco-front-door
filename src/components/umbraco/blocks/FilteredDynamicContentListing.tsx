import { useEffect, useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { Button } from "@/components/ui/button";
import type { ContentItem } from "@/integrations/umbraco/types";
import { inferCultureFromPath, type Culture } from "@/lib/culture";
import { cn } from "@/lib/utils";

import {
  ListingCard,
  filterBySegmentTags,
  itemTagIds,
  pageProps,
  parseSortOrder,
  sortListingItems,
  sourceChildrenQueryOptions,
  tagIds,
  type SortDir,
  type SortKey,
  type TagRef,
} from "./listing-shared";
import type { BlockComponentProps } from "./registry";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");

interface FilterGroupProps {
  heading?: string | null;
  filterTags?: TagRef[] | null;
  collapsed?: boolean | null;
  displayFilterTagsAsRadioButtons?: boolean | null;
}

interface FilteredSegmentProps {
  filteredSegmentName?: string | null;
  filteredSegmentSource?: ContentItem[] | null;
  filteredSegmentFilterGroups?: {
    items?: Array<{ content: { id: string; properties: unknown } }>;
  } | null;
  filteredSegmentTags?: TagRef[] | null;
  filteredSegmentMustContainTags?: TagRef[] | null;
  filteredSegmentSortOrder?: string | null;
  filteredSegmentUseAndBetweenFilterGroups?: boolean | null;
  filteredSegmentHideFilterSection?: boolean | null;
  filteredSegmentHideFilterSearch?: boolean | null;
  filteredSegmentHideSortOrderButtons?: boolean | null;
  filteredSegmentShowItemsAsGrid?: boolean | null;
}

interface FdclContent {
  heading?: string | null;
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  filteredSegments?: {
    items?: Array<{ content: { id: string; properties: unknown } }>;
  } | null;
  readMoreButtonText?: string | null;
}

interface FdclSettings {
  itemsPerPage?: number | string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  anchorId?: string | null;
}

const LABELS = {
  sv: {
    search: "Sök...",
    clear: "Rensa filter",
    title: "Titel",
    date: "Datum",
    showing: (a: number, b: number) => `Visar ${a} av ${b}`,
    loadMore: "Ladda fler",
    readMore: "Läs mer",
    empty: "Inga träffar.",
    grid: "Rutnät",
    list: "Lista",
  },
  en: {
    search: "Search...",
    clear: "Clear filters",
    title: "Title",
    date: "Date",
    showing: (a: number, b: number) => `Showing ${a} of ${b}`,
    loadMore: "Load more",
    readMore: "Read more",
    empty: "No results.",
    grid: "Grid",
    list: "List",
  },
} as const;

function nextSort(current: SortDir | null): SortDir | null {
  if (current === null) return "asc";
  if (current === "asc") return "desc";
  return null;
}

function SortButton({
  label,
  dir,
  onClick,
}: {
  label: string;
  dir: SortDir | null;
  onClick: () => void;
}) {
  const Icon = dir === "asc" ? ChevronUp : dir === "desc" ? ChevronDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={dir !== null}
      className={cn(
        "inline-flex items-center gap-2 border border-foreground/20 px-5 py-3 text-sm font-medium transition",
        dir !== null
          ? "bg-background-primary text-background-primary-contrast"
          : "bg-card hover:bg-muted",
      )}
    >
      {label}
      <Icon className="size-4" />
    </button>
  );
}

function FilterGroupPanel({
  group,
  selected,
  onToggle,
}: {
  group: { id: string; props: FilterGroupProps };
  selected: string[];
  onToggle: (tagId: string, radio: boolean) => void;
}) {
  const [open, setOpen] = useState(group.props.collapsed !== true);
  const radio = group.props.displayFilterTagsAsRadioButtons === true;
  const tags = (group.props.filterTags ?? []).filter((t) => t?.id);

  if (!tags.length) return null;

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 bg-background-secondary px-4 py-3 text-left text-sm font-semibold text-background-secondary-contrast"
      >
        {group.props.heading ?? ""}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <ul className="mt-3 space-y-2 px-1">
          {tags.map((tag) => {
            const id = tag.id as string;
            const checked = selected.includes(id);
            return (
              <li key={id}>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type={radio ? "radio" : "checkbox"}
                    name={radio ? `fg-${group.id}` : undefined}
                    checked={checked}
                    onChange={() => onToggle(id, radio)}
                    className="size-4 accent-[var(--background-primary)]"
                  />
                  <span>{tag.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function FilteredDynamicContentListing({
  content,
  settings,
}: BlockComponentProps) {
  const { heading, text, filteredSegments, readMoreButtonText } =
    content as unknown as FdclContent;
  const s = (settings ?? {}) as unknown as FdclSettings;
  const perPage = Number(s.itemsPerPage ?? 6) || 6;

  const segmentList = useMemo(
    () =>
      (filteredSegments?.items ?? []).map((item) => ({
        id: item.content.id,
        props: (item.content.properties ?? {}) as unknown as FilteredSegmentProps,
      })),
    [filteredSegments],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const active = segmentList[activeIndex];
  const activeProps = active?.props;

  const culture: Culture = inferCultureFromPath(
    activeProps?.filteredSegmentSource?.[0]?.route?.path ?? "/",
  );
  const t = LABELS[culture];
  const buttonText = readMoreButtonText ?? t.readMore;

  const groups = useMemo(
    () =>
      (activeProps?.filteredSegmentFilterGroups?.items ?? []).map((g) => ({
        id: g.content.id,
        props: (g.content.properties ?? {}) as unknown as FilterGroupProps,
      })),
    [activeProps],
  );

  const defaultSort = parseSortOrder(activeProps?.filteredSegmentSortOrder);

  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [sortKey, setSortKey] = useState<SortKey>(defaultSort.key);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort.dir);
  const [grid, setGrid] = useState(activeProps?.filteredSegmentShowItemsAsGrid !== false);
  const [visible, setVisible] = useState(perPage);

  // Reset all interactive state when switching segment.
  useEffect(() => {
    const d = parseSortOrder(activeProps?.filteredSegmentSortOrder);
    setSearch("");
    setLetter(null);
    setSelectedTags({});
    setSortKey(d.key);
    setSortDir(d.dir);
    setGrid(activeProps?.filteredSegmentShowItemsAsGrid !== false);
    setVisible(perPage);
  }, [activeIndex, activeProps, perPage]);

  const results = useQueries({
    queries: segmentList.map((seg) => {
      const src = seg.props.filteredSegmentSource?.[0];
      const c = inferCultureFromPath(src?.route?.path ?? "/");
      return {
        ...sourceChildrenQueryOptions(src?.id ?? "none", c),
        enabled: Boolean(src?.id),
      };
    }),
  });

  const data = results[activeIndex]?.data;
  const isLoading = results[activeIndex]?.isLoading ?? false;

  const baseItems = useMemo(() => {
    if (!activeProps || !data) return [] as ContentItem[];
    const all = (data.items ?? []).filter((i) => i.contentType === "page");
    return filterBySegmentTags(
      all,
      activeProps.filteredSegmentTags,
      activeProps.filteredSegmentMustContainTags,
    );
  }, [activeProps, data]);

  const filtered = useMemo(() => {
    const useAnd = activeProps?.filteredSegmentUseAndBetweenFilterGroups === true;
    const activeGroups = groups
      .map((g) => selectedTags[g.id] ?? [])
      .filter((sel) => sel.length > 0);
    const q = search.trim().toLowerCase();

    const out = baseItems.filter((item) => {
      if (letter && !item.name.toUpperCase().startsWith(letter)) return false;

      if (q) {
        const desc = pageProps(item).listingForDynamicContentShortDescription ?? "";
        if (
          !item.name.toLowerCase().includes(q) &&
          !desc.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (activeGroups.length) {
        const own = itemTagIds(item);
        // Within a group: OR. Between groups: AND or OR per setting.
        const groupMatches = activeGroups.map((sel) =>
          sel.some((id) => own.includes(id)),
        );
        const ok = useAnd ? groupMatches.every(Boolean) : groupMatches.some(Boolean);
        if (!ok) return false;
      }

      return true;
    });

    return sortListingItems(out, sortKey, sortDir);
  }, [baseItems, groups, selectedTags, search, letter, sortKey, sortDir, activeProps]);

  const shown = filtered.slice(0, visible);

  function toggleTag(groupId: string, tagId: string, radio: boolean) {
    setVisible(perPage);
    setSelectedTags((prev) => {
      const cur = prev[groupId] ?? [];
      if (radio) {
        return { ...prev, [groupId]: cur.includes(tagId) ? [] : [tagId] };
      }
      return {
        ...prev,
        [groupId]: cur.includes(tagId)
          ? cur.filter((id) => id !== tagId)
          : [...cur, tagId],
      };
    });
  }

  function clearFilters() {
    const d = parseSortOrder(activeProps?.filteredSegmentSortOrder);
    setSearch("");
    setLetter(null);
    setSelectedTags({});
    setSortKey(d.key);
    setSortDir(d.dir);
    setVisible(perPage);
  }

  function cycleSort(key: Exclude<SortKey, null>) {
    setVisible(perPage);
    const current = sortKey === key ? sortDir : null;
    const next = nextSort(current);
    if (next === null) {
      setSortKey(null);
      setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir(next);
    }
  }

  if (!segmentList.length) return null;

  const hideFilters = activeProps?.filteredSegmentHideFilterSection === true;
  const hideSearch = activeProps?.filteredSegmentHideFilterSearch === true;
  const hideSort = activeProps?.filteredSegmentHideSortOrderButtons === true;
  const hasFilterGroups = !hideFilters && groups.length > 0;
  const availableLetters = new Set(
    baseItems.map((i) => i.name.charAt(0).toUpperCase()),
  );

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
            className="flex flex-wrap gap-1 border-b border-foreground/15"
            role="tablist"
            aria-label={heading ?? "Segments"}
          >
            {segmentList.map((seg, i) => (
              <button
                key={seg.id}
                type="button"
                role="tab"
                aria-selected={i === activeIndex}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "px-8 py-5 text-sm font-semibold transition",
                  i === activeIndex
                    ? "bg-background-primary text-background-primary-contrast"
                    : "bg-background-secondary text-background-secondary-contrast opacity-70 hover:opacity-100",
                )}
              >
                {seg.props.filteredSegmentName ?? `Segment ${i + 1}`}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          {!hideSearch ? (
            <label className="flex items-center gap-3 border border-foreground/20 bg-card px-4 py-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(perPage);
                }}
                placeholder={t.search}
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {ALPHABET.map((l) => {
              const enabled = availableLetters.has(l);
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!enabled}
                  aria-pressed={letter === l}
                  onClick={() => {
                    setLetter(letter === l ? null : l);
                    setVisible(perPage);
                  }}
                  className={cn(
                    "size-9 border border-foreground/20 text-sm font-medium transition",
                    letter === l
                      ? "bg-background-primary text-background-primary-contrast"
                      : "bg-card hover:bg-muted",
                    !enabled && "cursor-not-allowed opacity-35 hover:bg-card",
                  )}
                >
                  {l}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="border border-foreground/20 bg-card px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              {t.clear}
            </button>
            {!hideSort ? (
              <>
                <SortButton
                  label={t.title}
                  dir={sortKey === "title" ? sortDir : null}
                  onClick={() => cycleSort("title")}
                />
                <SortButton
                  label={t.date}
                  dir={sortKey === "date" ? sortDir : null}
                  onClick={() => cycleSort("date")}
                />
              </>
            ) : null}

            <div className="ml-auto flex">
              <button
                type="button"
                aria-label={t.grid}
                aria-pressed={grid}
                onClick={() => setGrid(true)}
                className={cn(
                  "border border-foreground/20 p-3 transition",
                  grid
                    ? "bg-background-primary text-background-primary-contrast"
                    : "bg-card hover:bg-muted",
                )}
              >
                <LayoutGrid className="size-5" />
              </button>
              <button
                type="button"
                aria-label={t.list}
                aria-pressed={!grid}
                onClick={() => setGrid(false)}
                className={cn(
                  "border border-l-0 border-foreground/20 p-3 transition",
                  !grid
                    ? "bg-background-primary text-background-primary-contrast"
                    : "bg-card hover:bg-muted",
                )}
              >
                <List className="size-5" />
              </button>
            </div>
          </div>

          <p className="text-right text-sm text-muted-foreground">
            {t.showing(shown.length, filtered.length)}
          </p>
        </div>

        <div
          className={cn(
            "mt-8 gap-10",
            hasFilterGroups ? "md:grid md:grid-cols-[16rem_1fr]" : "block",
          )}
        >
          {hasFilterGroups ? (
            <aside className="mb-8 md:mb-0">
              {groups.map((group) => (
                <FilterGroupPanel
                  key={group.id}
                  group={group}
                  selected={selectedTags[group.id] ?? []}
                  onToggle={(tagId, radio) => toggleTag(group.id, tagId, radio)}
                />
              ))}
            </aside>
          ) : null}

          <div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">…</p>
            ) : shown.length ? (
              <div
                className={cn(
                  "grid gap-8",
                  grid ? "sm:grid-cols-2" : "grid-cols-1",
                )}
              >
                {shown.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    buttonText={buttonText}
                    horizontal={!grid}
                    showDate
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.empty}</p>
            )}

            {filtered.length > visible ? (
              <div className="mt-12 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setVisible((v) => v + perPage)}
                >
                  {t.loadMore}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

// Keeps `tagIds` re-exported for consumers importing from this module.
export { tagIds };
