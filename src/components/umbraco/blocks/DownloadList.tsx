import { FileText } from "lucide-react";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { resolveUmbracoMediaUrl, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import type { BlockItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

type DownloadMedia = UmbracoMediaLike & { bytes?: number | null; extension?: string | null };

interface DownloadListFileContent {
  title?: string;
  downloadFile?: DownloadMedia[];
}

interface DownloadListContent {
  heading?: string;
  text?: { markup?: string; blocks?: unknown[] } | string;
  files?: { items?: BlockItem[] };
}

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface DownloadListSettings {
  fullWidth?: boolean | null;
  containerWidth?: string | null;
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

function formatBytes(bytes: number | null | undefined): string | null {
  if (!bytes && bytes !== 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default function DownloadList({ content, settings }: BlockComponentProps) {
  const { heading, text, files } = content as unknown as DownloadListContent;
  const items = files?.items ?? [];

  const s = (settings ?? {}) as unknown as DownloadListSettings;
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
          <RichTextRenderer
            value={text}
            className={cn("mt-4", light && "prose-invert")}
          />
        ) : null}

        {items.length ? (
          <ul
            className={cn(
              "mt-8 border-t",
              light ? "border-text-light/20" : "border-border",
            )}
          >
            {items.map((item) => {
              const c = (item.content?.properties ?? {}) as unknown as DownloadListFileContent;
              const media = c.downloadFile?.[0];
              if (!media) return null;
              const href = resolveUmbracoMediaUrl(media.url);
              const size = formatBytes(media.bytes ?? null);
              return (
                <li
                  key={item.content.id}
                  className={cn(
                    "border-b",
                    light ? "border-text-light/20" : "border-border",
                  )}
                >
                  <a
                    href={href}
                    download={media.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group flex items-center gap-4 py-5 transition-colors",
                      light
                        ? "text-text-light hover:text-primary"
                        : "text-foreground hover:text-primary",
                    )}
                  >
                    <FileText
                      className="h-5 w-5 shrink-0 opacity-80 transition-opacity group-hover:opacity-100"
                      aria-hidden
                    />
                    <span className="flex-1 font-medium">
                      {c.title ?? media.name}
                    </span>
                    {size ? (
                      <span
                        className={cn(
                          "shrink-0 text-sm tabular-nums",
                          light ? "text-text-light/80" : "text-muted-foreground",
                        )}
                      >
                        {size}
                      </span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
