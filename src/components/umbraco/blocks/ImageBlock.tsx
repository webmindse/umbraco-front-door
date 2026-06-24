import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface ImageBlockContent {
  image?: UmbracoMediaLike[] | null;
  caption?: string | null;
  hotSpotText?: string | null;
}

interface ImageBlockSettings {
  anchorId?: string | null;
  /** e.g. "50%", "66%", "100%" */
  width?: string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  hideHotSpot?: boolean | null;
}

function HotSpot({
  left,
  top,
  text,
}: {
  left: number;
  top: number;
  text: string;
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const hoverHandlers = isMobile
    ? {}
    : {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
      };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${left * 100}%`, top: `${top * 100}%` }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={text}
            className={cn(
              "block h-6 w-6 rounded-full border-2 border-white bg-brand-mauve-shadow shadow-md",
              "transition-transform hover:scale-110 focus:scale-110 focus:outline-none",
              "ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand-mauve-shadow",
            )}
            {...hoverHandlers}
          />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="center"
          sideOffset={8}
          className="w-56 bg-background text-foreground text-sm leading-snug"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {text}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function ImageBlock({ content, settings }: BlockComponentProps) {
  const { image, caption, hotSpotText } =
    content as unknown as ImageBlockContent;
  const s = (settings ?? {}) as unknown as ImageBlockSettings;

  const img = image?.[0];
  if (!img) return null;

  const containerStyle = { maxWidth: s.width ?? "66%" };

  const showHotSpot =
    !s.hideHotSpot && img.focalPoint != null && Boolean(hotSpotText);

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
      <figure className="relative m-0">
        <UmbracoImage
          media={img}
          width={1600}
          alt={img.name}
          className="block h-auto w-full"
        />

        {showHotSpot && img.focalPoint ? (
          <HotSpot
            left={img.focalPoint.left}
            top={img.focalPoint.top}
            text={hotSpotText ?? ""}
          />
        ) : null}

        {caption ? (
          <figcaption className="absolute bottom-0 right-0 bg-brand-onyx px-6 py-3 text-sm text-text-light">
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}
