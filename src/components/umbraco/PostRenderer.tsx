import type { BlockItem, ContentItem, JsonObject } from "@/integrations/umbraco/types";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { inferCultureFromPath } from "@/lib/culture";

import { BlockListRenderer } from "./BlockListRenderer";
import { RichTextRenderer } from "./RichTextRenderer";

interface PostProps {
  preHeading?: string | null;
  heading?: string | null;
  introText?: string | null;
  image?: UmbracoMediaLike[] | null;
  text?: { markup?: string } | string | null;
  blocks?: { items?: BlockItem[] } | null;
  date?: string | null;
}

export function PostRenderer({ post }: { post: ContentItem }) {
  const p = (post.properties ?? {}) as unknown as PostProps;
  const culture = inferCultureFromPath(post.route?.path ?? "/");
  const hero = p.image?.[0];

  const date = p.date ? new Date(p.date) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat(culture === "en" ? "en-GB" : "sv-SE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(date)
      : null;

  return (
    <article>
      <header className="mx-auto max-w-3xl px-6 pt-12 md:pt-16">
        {p.preHeading ? (
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {p.preHeading}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-4xl tracking-tight md:text-5xl">
          {p.heading ?? post.name}
        </h1>
        {dateLabel ? (
          <p className="mt-3 text-sm text-muted-foreground">{dateLabel}</p>
        ) : null}
        {p.introText ? (
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {p.introText}
          </p>
        ) : null}
      </header>

      {hero ? (
        <div className="mx-auto mt-10 max-w-5xl px-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <UmbracoImage media={hero} width={1600} fill alt={hero.name} loading="eager" />
          </div>
        </div>
      ) : null}

      {p.text ? (
        <div className="mx-auto max-w-3xl px-6 py-12">
          <RichTextRenderer
            value={p.text as unknown as JsonObject}
            className="prose-a:text-link prose-a:underline prose-a:underline-offset-4"
          />
        </div>
      ) : null}

      <BlockListRenderer items={p.blocks?.items ?? []} />
    </article>
  );
}
