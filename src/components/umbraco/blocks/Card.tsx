import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import { Button } from "@/components/ui/button";
import type { JsonObject } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

type ButtonColor = "Primary" | "Secondary" | "Transparent" | string;

interface CardContent {
  heading?: string;
  text?: { markup?: string; blocks?: unknown[] } | string;
  image?: UmbracoMediaLike[];
  icon?: string | null;
  link?: UmbracoLinkPickerItem[] | null;
  buttonOne?: UmbracoLinkPickerItem[] | null;
  buttonOneColor?: ButtonColor;
  buttonTwo?: UmbracoLinkPickerItem[] | null;
  buttonTwoColor?: ButtonColor;
}

export interface CardSettings {
  /** "25%" | "33%" | "50%" | "100%" — desktop flex-basis. Mobile is always full width. */
  width?: string;
  /** Render a panel with bg + shadow around the card. */
  boxed?: boolean;
  /** Center text and button alignment. */
  centerContent?: boolean;
  /** On md+, lay out image left / content right. */
  mediaLeft?: boolean;
  /** Add a 1px border around the card. */
  border?: boolean;
  /** When true and an icon is present, show the icon instead of the image. */
  preferIcon?: boolean;
}

function variantFor(color: ButtonColor | undefined) {
  switch (color) {
    case "Secondary":
      return "secondary" as const;
    case "Transparent":
      return "outline" as const;
    case "Primary":
    default:
      return "default" as const;
  }
}

function CardButton({
  link,
  color,
}: {
  link: UmbracoLinkPickerItem | undefined;
  color: ButtonColor | undefined;
}) {
  if (!link) return null;
  return (
    <Button asChild size="default" variant={variantFor(color)}>
      <span>
        <UmbracoLink link={link as unknown as JsonObject}>{link.title}</UmbracoLink>
      </span>
    </Button>
  );
}

export default function Card({ content, settings }: BlockComponentProps) {
  const {
    heading,
    text,
    image,
    icon,
    link,
    buttonOne,
    buttonOneColor,
    buttonTwo,
    buttonTwoColor,
  } = content as unknown as CardContent;

  const {
    width,
    boxed,
    centerContent,
    mediaLeft,
    border,
    preferIcon,
  } = (settings ?? {}) as unknown as CardSettings;

  const linkItem = link?.[0];
  const isLinked = Boolean(linkItem);
  const showButtons = !isLinked && (buttonOne?.[0] || buttonTwo?.[0]);

  const media = image?.[0];
  const showIcon = preferIcon && icon;

  const containerClass = cn(
    "flex flex-col overflow-hidden",
    boxed && "rounded-lg bg-card shadow-md",
    border && "border border-border",
    isLinked && "transition hover:shadow-lg",
    mediaLeft && "md:grid md:grid-cols-[40%_1fr] md:items-stretch",
    centerContent && "text-center",
  );

  // Width applies on md+ (mobile is always full width via the Cards wrapper).
  // Subtract gap (1rem) so 33% × 3 + gaps fit per row.
  const basis = width ? `calc(${width} - 1rem)` : "100%";

  const mediaNode = showIcon ? (
    <div
      className={cn(
        "grid place-items-center p-6",
        centerContent && "justify-self-center",
      )}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  ) : media ? (
    <div
      className={cn(
        "relative w-full",
        mediaLeft ? "aspect-video md:aspect-auto md:min-h-[12rem] md:h-full" : "aspect-video",
      )}
    >
      <UmbracoImage media={media} width={960} fill alt={media.name} />
    </div>
  ) : null;

  const contentNode = (
    <div
      className={cn(
        "flex flex-1 flex-col",
        boxed || mediaLeft ? "p-6" : "pt-6",
      )}
    >
      {heading ? (
        <h3 className="text-lg font-semibold tracking-tight">{heading}</h3>
      ) : null}

      {text ? (
        <RichTextRenderer
          value={text}
          className={cn("mt-3 text-sm text-muted-foreground [&_p]:text-muted-foreground")}
        />
      ) : null}

      {showButtons ? (
        <div
          className={cn(
            "mt-6 flex flex-wrap gap-3",
            centerContent && "justify-center",
          )}
        >
          <CardButton link={buttonOne?.[0]} color={buttonOneColor} />
          <CardButton link={buttonTwo?.[0]} color={buttonTwoColor} />
        </div>
      ) : null}
    </div>
  );

  const inner = (
    <div className={containerClass}>
      {mediaNode}
      {contentNode}
    </div>
  );

  return (
    <div
      style={{ flexBasis: basis, maxWidth: basis }}
      className="w-full flex-shrink-0 flex-grow-0 max-md:!basis-full max-md:!max-w-full"
    >
      {isLinked ? (
        <UmbracoLink
          link={linkItem as unknown as JsonObject}
          className="block h-full no-underline text-inherit"
        >
          {inner}
        </UmbracoLink>
      ) : (
        inner
      )}
    </div>
  );
}
