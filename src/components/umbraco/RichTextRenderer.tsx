import type { JsonValue } from "@/integrations/umbraco/types";

interface RichTextRendererProps {
  value: JsonValue | { markup?: string } | string | null | undefined;
  className?: string;
}

/**
 * Render Umbraco rich-text. Accepts either a raw HTML string or the
 * `{ markup, blocks }` envelope. HTML is trusted because it originates
 * from authenticated CMS editors — never feed user input here.
 */
export function RichTextRenderer({ value, className }: RichTextRendererProps) {
  if (!value) return null;
  const html =
    typeof value === "string"
      ? value
      : typeof value === "object" && value !== null && "markup" in value
        ? (value as { markup?: string }).markup ?? ""
        : "";
  if (!html) return null;

  return (
    <div
      className={`prose prose-neutral max-w-none dark:prose-invert ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
