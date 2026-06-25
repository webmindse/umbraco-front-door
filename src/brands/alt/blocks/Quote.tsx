import { Quote as QuoteIcon } from "lucide-react";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";

import type { BlockComponentProps } from "@/components/umbraco/blocks/registry";

interface QuoteContent {
  quoteText?: string;
  author?: string;
  authorImage?: UmbracoMediaLike[];
  authorTitle?: string;
}

/**
 * Alt brand Quote — editorial pull-quote with coral accent bar.
 * Settings honored: applyMarginAbove/Below.
 */
export default function Quote({ content, settings }: BlockComponentProps) {
  const { quoteText, author, authorImage, authorTitle } =
    content as unknown as QuoteContent;
  const s = (settings ?? {}) as {
    applyMarginAbove?: boolean | null;
    applyMarginBelow?: boolean | null;
    anchorId?: string | null;
  };
  const image = authorImage?.[0];

  return (
    <section
      id={s.anchorId ?? undefined}
      className={`mx-auto max-w-3xl px-6 ${
        s.applyMarginAbove !== false ? "mt-16 md:mt-24" : ""
      } ${s.applyMarginBelow !== false ? "mb-16 md:mb-24" : ""}`}
    >
      <div className="relative pl-8 md:pl-12">
        <span
          aria-hidden
          className="absolute left-0 top-0 h-full w-1 bg-[color:var(--brand-alt-coral)]"
        />
        <QuoteIcon
          className="mb-4 h-10 w-10 rotate-180 text-[color:var(--brand-alt-coral)]"
          aria-hidden
        />
        {quoteText ? (
          <p className="font-display text-2xl font-medium leading-snug text-[color:var(--brand-alt-deep-indigo)] md:text-3xl">
            {quoteText}
          </p>
        ) : null}
        {(author || authorTitle || image) && (
          <div className="mt-8 flex items-center gap-4">
            {image ? (
              <UmbracoImage
                media={image}
                width={56}
                height={56}
                alt={author ?? image.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-[color:var(--brand-alt-coral)]/40"
              />
            ) : null}
            <div className="leading-tight">
              {author ? (
                <div className="font-display text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand-alt-mauve)]">
                  {author}
                </div>
              ) : null}
              {authorTitle ? (
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[color:var(--brand-alt-mauve)]/70">
                  {authorTitle}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
