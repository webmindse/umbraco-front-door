import {
  Accordion as UIAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import type { BlockItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface AccordionItemContent {
  heading?: string;
  text?: { markup?: string; blocks?: unknown[] } | string;
}

interface AccordionContentProps {
  heading?: string;
  text?: string;
  accordionBlocks?: { items?: BlockItem[] };
}

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface AccordionSettings {
  fullWidth?: boolean | null;
  /** e.g. "66%", "75%", "100%" */
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

export default function Accordion({ content, settings }: BlockComponentProps) {
  const { heading, text, accordionBlocks } =
    content as unknown as AccordionContentProps;
  const items = accordionBlocks?.items ?? [];

  const s = (settings ?? {}) as unknown as AccordionSettings;
  const { wrap, light } = bgClasses(s.backgroundColor ?? "None");

  const containerStyle = s.fullWidth
    ? { maxWidth: "100%" }
    : s.containerWidth
      ? { maxWidth: s.containerWidth }
      : { maxWidth: "66%" };
  const contentStyle = { maxWidth: s.contentWidth ?? "75%" };

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        "mx-auto px-6",
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
        wrap && "py-12 md:py-16",
        wrap,
      )}
      style={containerStyle}
    >
      
        <div className="mx-auto" style={contentStyle}>
          {heading ? (
            <h2
              className={cn(
                "text-3xl font-semibold tracking-tight md:text-4xl",
                light && "text-text-light",
              )}
            >
              {heading}
            </h2>
          ) : null}
          {text ? (
            <p
              className={cn(
                "mt-4 text-base",
                light ? "text-text-light/90" : "text-muted-foreground",
              )}
            >
              {text}
            </p>
          ) : null}

          {items.length ? (
            <UIAccordion
              type="single"
              collapsible
              className={cn(
                "mt-8 w-full border-t",
                light ? "border-text-light/20" : "border-border",
              )}
            >
              {items.map((item) => {
                const c = (item.content?.properties ?? {}) as unknown as AccordionItemContent;
                return (
                  <AccordionItem
                    key={item.content.id}
                    value={item.content.id}
                    className={cn(
                      "border-b",
                      light ? "!border-text-light/20" : "border-border",
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "py-5 text-base font-semibold hover:no-underline",
                        light && "text-text-light [&>svg]:text-text-light",
                      )}
                    >
                      {c.heading ?? ""}
                    </AccordionTrigger>
                    <AccordionContent
                      className={cn(
                        light ? "text-text-light/90" : "text-foreground",
                      )}
                    >
                      <RichTextRenderer
                        value={c.text}
                        className={cn(light && "prose-invert")}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </UIAccordion>
          ) : null}
        </div>
    </section>
  );
}
