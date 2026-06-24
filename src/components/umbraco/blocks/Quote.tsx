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
  // Squircle overrides width + defaults to Primary background
  const effectiveBg: BgColor = squircle
    ? (s.backgroundColor && s.backgroundColor !== "None"
        ? s.backgroundColor
        : "Primary")
    : (s.backgroundColor ?? "None");
  const { wrap, light } = bgClasses(effectiveBg);

  const image = authorImage?.[0];

  // Outer section handles optional full-width background.
  const fullBg = !!s.fullWidth && !squircle && !!wrap;

  // Width of the actual quote box.
  const widthStyle: React.CSSProperties = squircle
    ? { width: "min(560px, 90vw)", aspectRatio: "1 / 1" }
    : { maxWidth: s.width ?? "100%" };

  const box = (
    <div
      className={cn(
        "mx-auto px-8 py-10 md:px-12 md:py-14",
        !fullBg && wrap,
        squircle &&
          "flex flex-col justify-center [border-radius:38%_42%_40%_44%_/_42%_38%_44%_40%]",
      )}
      style={widthStyle}
    >
      <QuoteIcon
        className={cn(
          "h-8 w-8 rotate-180 mb-4",
          light ? "text-text-light" : "text-foreground",
        )}
        aria-hidden
      />
      {quoteText ? (
        <p
          className={cn(
            "text-lg md:text-xl leading-relaxed",
            squircle ? "text-left" : "text-center",
            light ? "text-text-light" : "text-foreground",
          )}
        >
          {quoteText}
        </p>
      ) : null}

      {(author || authorTitle || image) && (
        <div
          className={cn(
            "mt-6 flex items-center gap-3",
            squircle ? "justify-start" : "justify-center",
          )}
        >
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
