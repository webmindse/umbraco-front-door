import { useMemo } from "react";

import type { JsonObject } from "@/integrations/umbraco/types";

export interface UmbracoMediaLike {
  url?: string;
  name?: string;
  width?: number | null;
  height?: number | null;
  focalPoint?: { left: number; top: number } | null;
  properties?: JsonObject;
}

interface UmbracoImageProps {
  media: UmbracoMediaLike | null | undefined;
  /** Render width hint (used to request a CMS-resized image). */
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  sizes?: string;
  /** When true, applies an absolute fill via object-cover (parent must be positioned). */
  fill?: boolean;
}

const CMS_BASE = (import.meta.env.VITE_UMBRACO_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

export function resolveUmbracoMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (!CMS_BASE) return url;
  return `${CMS_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

const resolveUrl = resolveUmbracoMediaUrl;

export function UmbracoImage({
  media,
  width,
  height,
  alt,
  className,
  loading = "lazy",
  sizes,
  fill,
}: UmbracoImageProps) {
  const src = useMemo(() => {
    if (!media?.url) return null;
    const base = resolveUrl(media.url);
    const params = new URLSearchParams();
    if (width) params.set("width", String(width));
    if (height) params.set("height", String(height));
    if (width && height) params.set("rmode", "crop");
    if (media.focalPoint) {
      params.set("rxy", `${media.focalPoint.left},${media.focalPoint.top}`);
    }
    const qs = params.toString();
    return qs ? `${base}${base.includes("?") ? "&" : "?"}${qs}` : base;
  }, [media, width, height]);

  // Compute intrinsic width/height attributes for the rendered image so the
  // aspect ratio matches the requested constraint (and the resized src). When
  // only one dimension is requested, derive the other from the media's aspect
  // ratio so the image is not squashed by stale original-media dimensions.
  const aspectRatio = useMemo(() => {
    if (!media?.width || !media?.height) return null;
    return media.width / media.height;
  }, [media]);

  const { intrinsicWidth, intrinsicHeight } = useMemo(() => {
    if (!media) return { intrinsicWidth: undefined, intrinsicHeight: undefined };
    if (width && height) {
      return { intrinsicWidth: width, intrinsicHeight: height };
    }
    if (width && aspectRatio) {
      return { intrinsicWidth: width, intrinsicHeight: Math.round(width / aspectRatio) };
    }
    if (height && aspectRatio) {
      return { intrinsicWidth: Math.round(height * aspectRatio), intrinsicHeight: height };
    }
    return {
      intrinsicWidth: media.width ?? undefined,
      intrinsicHeight: media.height ?? undefined,
    };
  }, [media, width, height, aspectRatio]);

  if (!media || !src) return null;

  return (
    <img
      src={src}
      alt={alt ?? media.name ?? ""}
      width={intrinsicWidth}
      height={intrinsicHeight}
      loading={loading}
      sizes={sizes}
      className={
        fill
          ? `absolute inset-0 h-full w-full object-cover ${className ?? ""}`
          : className
      }
    />
  );
}
