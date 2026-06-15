import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { resolveUmbracoMediaUrl, UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import { Button } from "@/components/ui/button";
import type { JsonObject } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

type ButtonColor = "Primary" | "Secondary" | "Transparent" | string;
type MediaAlignment = "Above" | "Below" | "Left" | "Right" | "Behind" | string;
type TextAlignment = "Center" | "Left" | "Right" | string;

interface VideoMedia extends UmbracoMediaLike {
  mediaType?: string;
}

interface TextAndMediaContent {
  preHeading?: string;
  heading?: string;
  text?: { markup?: string; blocks?: unknown[] } | string;
  image?: UmbracoMediaLike[] | null;
  imageCaption?: string | null;
  video?: VideoMedia[] | null;
  videoCaption?: string | null;
  youTube?: string | null;
  vimeo?: string | null;
  buttonOne?: UmbracoLinkPickerItem[] | null;
  buttonOneColor?: ButtonColor;
  buttonTwo?: UmbracoLinkPickerItem[] | null;
  buttonTwoColor?: ButtonColor;
}

interface TextAndMediaSettings {
  mediaAlignment?: MediaAlignment;
  textAlignment?: TextAlignment;
  preferVideo?: boolean;
  applyBackgroundColor?: boolean;
  applyBorder?: boolean;
  applyRoundedCorners?: boolean;
  applyMarginAbove?: boolean;
  applyMarginBelow?: boolean;
  anchorId?: string | null;
  squareImage?: boolean;
  circleImage?: boolean;
  showEntireImage?: boolean;
  showControls?: boolean;
  autoPlay?: boolean;
  mute?: boolean;
  loop?: boolean;
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

function TmButton({
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

function youTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/,
  );
  return m ? m[1] : /^[\w-]{6,}$/.test(url) ? url : null;
}

function vimeoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : /^\d+$/.test(url) ? url : null;
}

export default function TextAndMedia({ content, settings }: BlockComponentProps) {
  const {
    preHeading,
    heading,
    text,
    image,
    imageCaption,
    video,
    videoCaption,
    youTube,
    vimeo,
    buttonOne,
    buttonOneColor,
    buttonTwo,
    buttonTwoColor,
  } = content as unknown as TextAndMediaContent;

  const s = (settings ?? {}) as unknown as TextAndMediaSettings;
  const alignment: MediaAlignment = s.mediaAlignment ?? "Right";
  const textAlign: TextAlignment = s.textAlignment ?? "Left";

  const img = image?.[0];
  const vid = video?.[0];
  const yt = youTubeId(youTube);
  const vm = vimeoId(vimeo);
  const hasVideo = Boolean(vid || yt || vm);
  const hasImage = Boolean(img);
  const useVideo = hasVideo && (s.preferVideo || !hasImage);

  const textAlignClass =
    textAlign === "Center" ? "text-center" : textAlign === "Right" ? "text-right" : "text-left";
  const buttonsJustify =
    textAlign === "Center"
      ? "justify-center"
      : textAlign === "Right"
        ? "justify-end"
        : "justify-start";

  // Media node
  let mediaNode: React.ReactNode = null;
  if (useVideo) {
    const videoClass = cn(
      "w-full h-full object-cover",
      s.circleImage && "rounded-full aspect-square",
      s.squareImage && !s.circleImage && "aspect-square",
      s.applyRoundedCorners && !s.circleImage && "rounded-lg",
    );
    if (vid?.url) {
      mediaNode = (
        <video
          src={resolveUmbracoMediaUrl(vid.url)}
          className={videoClass}
          controls={s.showControls ?? true}
          autoPlay={s.autoPlay ?? false}
          muted={s.mute ?? false}
          loop={s.loop ?? false}
          playsInline
        />
      );
    } else if (yt) {
      mediaNode = (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            s.circleImage ? "aspect-square rounded-full" : "aspect-video",
            s.squareImage && !s.circleImage && "!aspect-square",
            s.applyRoundedCorners && !s.circleImage && "rounded-lg",
          )}
        >
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${yt}?${new URLSearchParams({
              autoplay: s.autoPlay ? "1" : "0",
              mute: s.mute ? "1" : "0",
              loop: s.loop ? "1" : "0",
              controls: (s.showControls ?? true) ? "1" : "0",
              playlist: s.loop ? yt : "",
            }).toString()}`}
            title="YouTube video"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else if (vm) {
      mediaNode = (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            s.circleImage ? "aspect-square rounded-full" : "aspect-video",
            s.squareImage && !s.circleImage && "!aspect-square",
            s.applyRoundedCorners && !s.circleImage && "rounded-lg",
          )}
        >
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://player.vimeo.com/video/${vm}?${new URLSearchParams({
              autoplay: s.autoPlay ? "1" : "0",
              muted: s.mute ? "1" : "0",
              loop: s.loop ? "1" : "0",
              controls: (s.showControls ?? true) ? "1" : "0",
            }).toString()}`}
            title="Vimeo video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  } else if (hasImage && img) {
    const shape = s.circleImage
      ? "aspect-square rounded-full"
      : s.squareImage
        ? "aspect-square"
        : "";
    const fit = s.showEntireImage ? "object-contain" : "object-cover";
    if (shape) {
      mediaNode = (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            shape,
            s.applyRoundedCorners && !s.circleImage && "rounded-lg",
          )}
        >
          <UmbracoImage
            media={img}
            width={1200}
            alt={img.name}
            className={cn("absolute inset-0 h-full w-full", fit)}
          />
        </div>
      );
    } else {
      mediaNode = (
        <UmbracoImage
          media={img}
          width={1200}
          alt={img.name}
          className={cn(
            "w-full h-auto",
            fit,
            s.applyRoundedCorners && "rounded-lg",
          )}
        />
      );
    }
  }

  const caption = useVideo ? videoCaption : imageCaption;
  const mediaWithCaption = mediaNode ? (
    <figure className="m-0">
      {mediaNode}
      {caption ? (
        <figcaption className="mt-2 text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  ) : null;

  const textNode = (
    <div
      className={cn(
        "flex flex-col",
        textAlignClass,
        s.applyBackgroundColor && "bg-muted rounded-lg p-6 md:p-8",
      )}
    >
      {preHeading ? (
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {preHeading}
        </p>
      ) : null}
      {heading ? (
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{heading}</h2>
      ) : null}
      {text ? <RichTextRenderer value={text} className="mt-4" /> : null}
      {(buttonOne?.[0] || buttonTwo?.[0]) && (
        <div className={cn("mt-6 flex flex-wrap gap-3", buttonsJustify)}>
          <TmButton link={buttonOne?.[0] ?? undefined} color={buttonOneColor} />
          <TmButton link={buttonTwo?.[0] ?? undefined} color={buttonTwoColor} />
        </div>
      )}
    </div>
  );

  const wrapperClass = cn(
    "mx-auto max-w-6xl px-6",
    s.applyMarginAbove && "mt-12 md:mt-16",
    s.applyMarginBelow && "mb-12 md:mb-16",
  );

  const innerClass = cn(
    s.applyBorder && "border border-border",
    s.applyRoundedCorners && "rounded-lg",
    (s.applyBorder || s.applyRoundedCorners) && "p-6 md:p-8 overflow-hidden",
  );

  // Behind: media as background, text overlaid
  if (alignment === "Behind" && mediaNode) {
    return (
      <section id={s.anchorId ?? undefined} className={wrapperClass}>
        <div className={cn("relative overflow-hidden", innerClass, s.applyRoundedCorners && "rounded-lg")}>
          <div className="absolute inset-0">
            {mediaNode}
            <div className="absolute inset-0 bg-black/40" aria-hidden />
          </div>
          <div className="relative z-10 p-8 md:p-16 text-text-light">
            {textNode}
          </div>
        </div>
      </section>
    );
  }

  // Above / Below: stacked
  if (alignment === "Above" || alignment === "Below" || !mediaNode) {
    return (
      <section id={s.anchorId ?? undefined} className={wrapperClass}>
        <div className={cn("flex flex-col gap-8", innerClass)}>
          {alignment === "Above" && mediaWithCaption}
          {textNode}
          {alignment === "Below" && mediaWithCaption}
        </div>
      </section>
    );
  }

  // Left / Right on md+, stacked on mobile (media first on mobile)
  const mediaFirst = alignment === "Left";
  return (
    <section id={s.anchorId ?? undefined} className={wrapperClass}>
      <div
        className={cn(
          "grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center",
          innerClass,
        )}
      >
        <div className={cn(mediaFirst ? "md:order-1" : "md:order-2")}>
          {mediaWithCaption}
        </div>
        <div className={cn(mediaFirst ? "md:order-2" : "md:order-1")}>{textNode}</div>
      </div>
    </section>
  );
}
