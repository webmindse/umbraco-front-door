import type { BlockItem, ContentItem, JsonObject, JsonValue } from "@/integrations/umbraco/types";

import { BlockGridRenderer } from "./BlockGridRenderer";
import { BlockListRenderer } from "./BlockListRenderer";

interface PageRendererProps {
  page: ContentItem;
}

/**
 * Walks the page's `properties` and renders any value that looks like a
 * Block List or Block Grid value. Properties are rendered in their natural
 * object order; the editor controls block order inside each list/grid.
 */
export function PageRenderer({ page }: PageRendererProps) {
  const props = (page.properties ?? {}) as JsonObject;
  const entries = Object.entries(props);

  return (
    <article>
      {entries.map(([key, value]) => {
        if (looksLikeBlockList(value)) {
          return (
            <BlockListRenderer
              key={key}
              items={(value as { items: BlockItem[] }).items}
            />
          );
        }
        if (looksLikeBlockGrid(value)) {
          return (
            <BlockGridRenderer
              key={key}
              value={value as { items: never[] } & JsonObject}
            />
          );
        }
        return null;
      })}
    </article>
  );
}

function looksLikeBlockList(value: JsonValue): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as JsonObject;
  if (!Array.isArray(v.items)) return false;
  const first = v.items[0];
  if (!first || typeof first !== "object") return v.items.length === 0;
  const f = first as JsonObject;
  // Block List items have `content` but NOT `columnSpan`/`areas`.
  return "content" in f && !("columnSpan" in f) && !("areas" in f);
}

function looksLikeBlockGrid(value: JsonValue): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as JsonObject;
  if (!Array.isArray(v.items)) return false;
  if ("gridColumns" in v) return true;
  const first = v.items[0];
  if (!first || typeof first !== "object") return false;
  const f = first as JsonObject;
  return "columnSpan" in f || "areas" in f;
}
