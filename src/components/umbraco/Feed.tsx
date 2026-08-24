import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { getChildren } from "@/lib/umbraco.functions";
import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";
import { inferCultureFromPath, type Culture } from "@/lib/culture";
import { cn } from "@/lib/utils";

type ChildrenFetcher = (args: {
  data: { id: string; culture: Culture };
}) => Promise<ContentResponse>;

export function feedPostsQueryOptions(feedId: string, culture: Culture) {
  return queryOptions({
    queryKey: ["umbraco-feed-posts", feedId, culture] as const,
    queryFn: () =>
      (getChildren as unknown as ChildrenFetcher)({ data: { id: feedId, culture } }),
    staleTime: 60_000,
  });
}

interface PostProps {
  date?: string | null;
  description?: string | null;
  listingImage?: UmbracoMediaLike[] | null;
  heading?: string | null;
}

function formatDate(value: string | null | undefined, culture: Culture) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(culture === "en" ? "en-GB" : "sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function bgClass(color: string | null | undefined) {
  switch (color) {
    case "Primary":
      return "bg-background-primary text-background-primary-contrast";
    case "Secondary":
      return "bg-background-secondary text-background-secondary-contrast";
    case "Neutral":
      return "bg-muted text-foreground";
    default:
      return "";
  }
}

export function PostCard({ post, culture }: { post: ContentItem; culture: Culture }) {
  const p = (post.properties ?? {}) as unknown as PostProps;
  const media = p.listingImage?.[0];
  const dateLabel = formatDate(p.date, culture);
  const href = post.route?.path ?? "/";

  return (
    <Link
      to={href}
      className="group flex h-full flex-col overflow-hidden bg-card text-card-foreground no-underline shadow-sm transition hover:shadow-lg"
    >
      {media ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <UmbracoImage
            media={media}
            width={720}
            fill
            alt={media.name}
            className="transition duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl tracking-tight">
          {p.heading ?? post.name}
        </h3>
        {dateLabel ? (
          <p className="mt-1 text-sm text-muted-foreground">{dateLabel}</p>
        ) : null}
        {p.description ? (
          <p className="mt-4 text-sm leading-relaxed text-link">{p.description}</p>
        ) : null}
      </div>
    </Link>
  );
}

interface FeedProps {
  feed: ContentItem;
}

export function Feed({ feed }: FeedProps) {
  const culture = inferCultureFromPath(feed.route?.path ?? "/");
  const { data } = useSuspenseQuery(feedPostsQueryOptions(feed.id, culture));

  const perPage = Number(feed.properties?.numberOfPosts ?? 6) || 6;
  const postWidth = Number(feed.properties?.postWidth ?? 0);
  const background = bgClass(feed.properties?.backgroundColor as string | null);

  const posts = useMemo(() => {
    const items = (data?.items ?? []).filter((i) => i.contentType === "post");
    return [...items].sort((a, b) => {
      const da = new Date((a.properties?.date as string) ?? a.createDate).getTime();
      const db = new Date((b.properties?.date as string) ?? b.createDate).getTime();
      return db - da;
    });
  }, [data]);

  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(posts.length / perPage));
  const current = posts.slice(page * perPage, page * perPage + perPage);

  if (!posts.length) return null;

  return (
    <section className={cn("w-full px-6 py-16", background)}>
      <div
        className="mx-auto"
        style={{ maxWidth: postWidth ? `${postWidth}%` : "72rem" }}
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {current.map((post) => (
            <PostCard key={post.id} post={post} culture={culture} />
          ))}
        </div>

        {pageCount > 1 ? (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-current={i === page ? "page" : undefined}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full text-sm font-semibold transition",
                  i === page
                    ? "bg-background-secondary text-background-secondary-contrast"
                    : "hover:bg-muted",
                )}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </section>
  );
}
