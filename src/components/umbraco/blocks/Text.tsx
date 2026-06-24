import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface TextContentProps {
  textContent?: { markup?: string; blocks?: unknown[] } | string;
}

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface TextSettings {
  fullWidth?: boolean | null;
  /** e.g. "50%", "66%", "100%" */
  containerWidth?: string | null;
  /** e.g. "75%", "100%" — relative to container */
  contentWidth?: string | null;
  backgroundColor?: BgColor;
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

export default function Text({ content, settings }: BlockComponentProps) {
  const { textContent } = content as unknown as TextContentProps;
  const s = (settings ?? {}) as unknown as TextSettings;
  const { wrap, light } = bgClasses(s.backgroundColor ?? "None");

  const containerStyle = s.fullWidth
    ? { maxWidth: "100%" }
    : s.containerWidth
      ? { maxWidth: s.containerWidth }
      : { maxWidth: "66%" };
  const contentStyle = { maxWidth: s.contentWidth ?? "100%" };

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        "mx-auto px-6",
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
      )}
      style={containerStyle}
    >
      <div className={cn(wrap && "px-8 py-12 md:px-16 md:py-16", wrap)}>
        <div className="mx-auto" style={contentStyle}>
          <RichTextRenderer
            value={textContent}
            className={cn(
              "prose-sm md:prose-base leading-relaxed",
              light &&
                "prose-invert prose-headings:text-text-light prose-p:text-text-light/90 prose-strong:text-text-light prose-hr:border-text-light/30",
            )}
          />
        </div>
      </div>
    </section>
  );
}
