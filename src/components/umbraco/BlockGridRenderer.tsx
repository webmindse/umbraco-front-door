import type { JsonObject, JsonValue } from "@/integrations/umbraco/types";
import { useBrand } from "@/brands/BrandContext";
import type { BlockComponent } from "./blocks/registry";

import MissingBlock from "./blocks/MissingBlock";

// Block Grid item shape (Delivery API v2):
//   { content, settings, columnSpan, rowSpan, areas: GridItem[] }
interface GridItem {
  content: { contentType: string; id: string; properties: JsonObject };
  settings: { contentType: string; id: string; properties: JsonObject } | null;
  columnSpan?: number;
  rowSpan?: number;
  areas?: GridArea[];
}

interface GridArea {
  alias: string;
  columnSpan?: number;
  rowSpan?: number;
  items: GridItem[];
}

interface BlockGridProps {
  /** Either the full block-grid value `{ items, gridColumns }` or just the items array. */
  value:
    | { items?: GridItem[]; gridColumns?: number }
    | GridItem[]
    | JsonValue
    | null
    | undefined;
  className?: string;
}

function renderItem(item: GridItem, blockRegistry: Record<string, BlockComponent>) {
  const alias = item.content?.contentType;
  const Component = alias ? blockRegistry[alias] : undefined;
  const cellStyle = {
    gridColumn: item.columnSpan ? `span ${item.columnSpan}` : undefined,
    gridRow: item.rowSpan ? `span ${item.rowSpan}` : undefined,
  };

  const body = Component ? (
    <Component
      content={item.content.properties ?? {}}
      settings={item.settings?.properties}
      block={item as never}
    />
  ) : (
    <MissingBlock alias={alias ?? "(unknown)"} content={item.content} />
  );

  return (
    <div key={item.content.id} style={cellStyle}>
      {body}
      {item.areas?.length ? (
        <div className="mt-4 space-y-4">
          {item.areas.map((area) => (
            <div
              key={`${item.content.id}:${area.alias}`}
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${area.columnSpan ?? 12}, minmax(0, 1fr))`,
              }}
            >
              {area.items.map((it) => renderItem(it, blockRegistry))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function BlockGridRenderer({ value, className }: BlockGridProps) {
  const { blockRegistry } = useBrand();
  const grid =
    Array.isArray(value)
      ? { items: value as GridItem[], gridColumns: 12 }
      : (value as { items?: GridItem[]; gridColumns?: number } | null) ?? null;
  const items = grid?.items ?? [];
  if (!items.length) return null;
  const columns = grid?.gridColumns ?? 12;

  return (
    <div
      className={`grid gap-6 ${className ?? ""}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((it) => renderItem(it, blockRegistry))}
    </div>
  );
}
