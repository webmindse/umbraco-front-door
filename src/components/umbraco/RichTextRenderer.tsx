import type { JsonValue } from "@/integrations/umbraco/types";

interface RichTextRendererProps {
  value: JsonValue | { markup?: string } | string | null | undefined;
  className?: string;
}

const CMS_BASE = (import.meta.env.VITE_UMBRACO_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * Rewrite root-relative URLs (e.g. `/media/...`) inside the RTE markup so
 * `<img src>` and `<a href>` resolve against the Umbraco origin rather than
 * the frontend host. Leaves absolute URLs, anchors, mailto, and tel alone.
 */
function rewriteRelativeUrls(html: string): string {
  if (!CMS_BASE) return html;
  return html.replace(
    /(<(?:img|a|source)\b[^>]*?\s(?:src|href))="(\/[^"#][^"]*)"/gi,
    (_m, prefix, url) => `${prefix}="${CMS_BASE}${url}"`,
  );
}

/**
 * Render Umbraco rich-text. Accepts either a raw HTML string or the
 * `{ markup, blocks }` envelope. HTML is trusted because it originates
 * from authenticated CMS editors — never feed user input here.
 */
export function RichTextRenderer({ value, className }: RichTextRendererProps) {
  if (!value) return null;
  const raw =
    typeof value === "string"
      ? value
      : typeof value === "object" && value !== null && "markup" in value
        ? (value as { markup?: string }).markup ?? ""
        : "";
  if (!raw) return null;
  const html = rewriteRelativeUrls(raw);

  return (
    <div
      className={`prose prose-neutral max-w-none dark:prose-invert ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
