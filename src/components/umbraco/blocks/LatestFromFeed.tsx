import { useSuspenseQuery } from "@tanstack/react-query";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import { PostCard, feedPostsQueryOptions } from "@/components/umbraco/Feed";
import { Button } from "@/components/ui/button";
import type { ContentItem, JsonObject } from "@/integrations/umbraco/types";
import { inferCultureFromPath } from "@/lib/culture";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface LatestFromFeedContent {
  preHeading?: string | null;
  heading?: string | null;
  introText?: { markup?: string; blocks?: unknown[] } | string | null;
  feedPage?: ContentItem[] | null;
  numberOfPosts?: number | string | null;
  button?: UmbracoLinkPickerItem[] | null;
  buttonColor?: string | null;
}

interface LatestFromFeedSettings {
  fullWidth?: boolean | null;
  containerWidth?: string | null;
  contentWidth?: string | null;
  backgroundColor?: BgColor;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  anchorId?: string | null;
  numberOfPosts?: number | string | null;
}

function bgClasses(color: BgColor): { wrap: string; light: boolean } {
  switch (color) {
    case "Primary":
      return { wrap: "bg-background-primary text-background-primary-contrast", light: true };
    case "Secondary":
      return { wrap: "bg-background-secondary text-background-secondary-contrast", light: true };
    default:
      return { wrap: "", light: false };
  }
}

function variantFor(color: string | null | undefined) {
  switch (color) {
    case "Secondary":
      return "secondary" as const;
    case "Transparent":
      return "outline" as const;
    default:
      return "default" as const;
  }
}

function PostGrid({
  feed,
  take,
}: {
  feed: ContentItem;
  take: number;
}) {
  const culture = inferCultureFromPath(feed.route?.path ?? "/");
  const { data } = useSuspenseQuery(feedPostsQueryOptions(feed.id, culture));

  const posts = [...(data?.items ?? [])]
    .filter((i) => i.contentType === "post")
    .sort((a, b) => {
      const da = new Date((a.properties?.date as string) ?? a.createDate).getTime();
      const db = new Date((b.properties?.date as string) ?? b.createDate).getTime();
      return db - da;
    })
    .slice(0, take);

  if (!posts.length) return null;

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} culture={culture} />
      ))}
    </div>
  );
}

export default function LatestFromFeed({ content, settings }: BlockComponentProps) {
  const {
    preHeading,
    heading,
    introText,
    feedPage,
    numberOfPosts,
    button,
    buttonColor,
  } = content as unknown as LatestFromFeedContent;
  const s = (settings ?? {}) as unknown as LatestFromFeedSettings;
  const { wrap, light } = bgClasses(s.backgroundColor ?? "None");

  const feed = feedPage?.[0];
  const take = Number(s.numberOfPosts ?? numberOfPosts ?? 3) || 3;
  const buttonLink = button?.[0];

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        "mx-auto w-full",
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
      )}
      style={s.fullWidth === false ? { maxWidth: s.containerWidth ?? "66%" } : undefined}
    >
      <div className={cn("px-6 py-12 md:px-12 md:py-16", wrap)}>
        <div className="mx-auto" style={{ maxWidth: s.contentWidth ?? "72rem" }}>
          {preHeading || heading || introText ? (
            <div className="mx-auto mb-12 max-w-3xl text-center">
              {preHeading ? (
                <p className="text-sm uppercase tracking-[0.3em] opacity-80">
                  {preHeading}
                </p>
              ) : null}
              {heading ? (
                <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                  {heading}
                </h2>
              ) : null}
              {introText ? (
                <RichTextRenderer
                  value={introText}
                  className={cn(
                    "prose-sm md:prose-base mt-4 leading-relaxed",
                    light && "prose-invert prose-p:text-text-light/90",
                  )}
                />
              ) : null}
            </div>
          ) : null}

          {feed ? <PostGrid feed={feed} take={take} /> : null}

          {buttonLink ? (
            <div className="mt-12 flex justify-center">
              <Button asChild size="lg" variant={variantFor(buttonColor)}>
                <span>
                  <UmbracoLink link={buttonLink as unknown as JsonObject}>
                    {buttonLink.title}
                  </UmbracoLink>
                </span>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
