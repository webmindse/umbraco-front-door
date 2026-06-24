import { Quote as QuoteIcon } from "lucide-react";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface QuoteContent {
  quoteText?: string;
  author?: string;
  authorImage?: UmbracoMediaLike[];
  authorTitle?: string;
}

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface QuoteSettings {
  /** e.g. "100%", "66%", "50%" */
  width?: string | null;
  backgroundColor?: BgColor;
  /** When true, background spans full screen width while content stays constrained. */
  fullWidth?: boolean | null;
  /** When true, render as a squircle. Overrides width and forces Primary bg. */
  showAsSquircle?: boolean | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  anchorId?: string | null;
}

function bgClasses(color: BgColor): { wrap: string; light: boolean } {
  switch (color) {
    case "Primary":
      return { wrap: "bg-brand-mauve-shadow text-text-light", light: true };
    case "Secondary":
      return { wrap: "bg-brand-onyx text-text-light", light: true };
    default:
      return { wrap: "", light: false };
  }
}

export default function Quote({ content, settings }: BlockComponentProps) {
  const { quoteText, author, authorImage, authorTitle } =
    content as unknown as QuoteContent;
  const s = (settings ?? {}) as unknown as QuoteSettings;

  const squircle = !!s.showAsSquircle;
  // Squircle overrides width + defaults to Secondary (onyx/dark) background
  const effectiveBg: BgColor = squircle
    ? (s.backgroundColor && s.backgroundColor !== "None"
        ? s.backgroundColor
        : "Secondary")
    : (s.backgroundColor ?? "None");
  const { wrap, light } = bgClasses(effectiveBg);

  const image = authorImage?.[0];

  // Outer section handles optional full-width background (rectangular only).
  const fullBg = !!s.fullWidth && !squircle && !!wrap;

  if (squircle) {
    return (
      <section
        id={s.anchorId ?? undefined}
        className={cn(
          "flex justify-center",
          s.applyMarginAbove !== false && "mt-12 md:mt-16",
          s.applyMarginBelow !== false && "mb-12 md:mb-16",
        )}
      >
        <div
          className={cn(
            "relative flex aspect-square w-full max-w-[340px] flex-col items-center justify-center p-8 text-center shadow-xl",
            wrap,
          )}
          style={{ borderRadius: "42% 58% 50% 50% / 45% 45% 55% 55%" }}
        >
          <QuoteIcon
            className={cn(
              "mb-6 h-7 w-7 rotate-180 opacity-90",
              light ? "text-text-light" : "text-foreground",
            )}
            aria-hidden
          />
          {quoteText ? (
            <p
              className={cn(
                "mb-8 max-w-[240px] text-lg font-medium leading-relaxed md:text-xl",
                light ? "text-text-light" : "text-foreground",
              )}
            >
              {quoteText}
            </p>
          ) : null}

          {(author || authorTitle || image) && (
            <div className="flex items-center gap-3 text-left">
              {image ? (
                <UmbracoImage
                  media={image}
                  width={48}
                  height={48}
                  alt={author ?? image.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : null}
              <div className="flex flex-col leading-tight">
                {author ? (
                  <span
                    className={cn(
                      "text-sm font-bold",
                      light ? "text-text-light" : "text-foreground",
                    )}
                  >
                    {author}
                  </span>
                ) : null}
                {authorTitle ? (
                  <span
                    className={cn(
                      "text-xs font-medium uppercase tracking-wider",
                      light ? "text-text-light/50" : "text-muted-foreground",
                    )}
                  >
                    {authorTitle}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Rectangular variant
  const widthStyle: React.CSSProperties = { maxWidth: s.width ?? "100%" };

  const box = (
    <div
      className={cn("mx-auto px-8 py-10 md:px-12 md:py-14", !fullBg && wrap)}
      style={widthStyle}
    >
      <QuoteIcon
        className={cn(
          "mb-4 h-8 w-8 rotate-180",
          light ? "text-text-light" : "text-foreground",
        )}
        aria-hidden
      />
      {quoteText ? (
        <p
          className={cn(
            "text-center text-lg leading-relaxed md:text-xl",
            light ? "text-text-light" : "text-foreground",
          )}
        >
          {quoteText}
        </p>
      ) : null}

      {(author || authorTitle || image) && (
        <div className="mt-6 flex items-center justify-center gap-3">
          {image ? (
            <UmbracoImage
              media={image}
              width={48}
              height={48}
              alt={author ?? image.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : null}
          <div className="leading-tight">
            {author ? (
              <div
                className={cn(
                  "font-semibold",
                  light ? "text-text-light" : "text-foreground",
                )}
              >
                {author}
              </div>
            ) : null}
            {authorTitle ? (
              <div
                className={cn(
                  "text-sm",
                  light ? "text-text-light/80" : "text-muted-foreground",
                )}
              >
                {authorTitle}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
        fullBg && wrap,
        fullBg && "py-12 md:py-16",
      )}
    >
      {box}
    </section>
  );
}
