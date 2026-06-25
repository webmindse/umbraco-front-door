import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";
import { useBrand } from "@/brands/BrandContext";

import MissingBlock from "./blocks/MissingBlock";

interface BlockListRendererProps {
  items: BlockItem[] | undefined | null;
}

export function BlockListRenderer({ items }: BlockListRendererProps) {
  const { blockRegistry, silentBlockAliases } = useBrand();
  if (!items?.length) return null;
  return (
    <>
      {items.map((item) => {
        const alias = item.content?.contentType;
        const Component = alias ? blockRegistry[alias] : undefined;
        if (!Component) {
          if (alias && silentBlockAliases.has(alias)) return null;
          return (
            <MissingBlock
              key={item.content?.id ?? alias}
              alias={alias ?? "(unknown)"}
              content={item.content}
            />
          );
        }
        return (
          <Component
            key={item.content.id}
            content={(item.content.properties ?? {}) as JsonObject}
            settings={(item.settings?.properties ?? undefined) as JsonObject | undefined}
            block={item}
          />
        );
      })}
    </>
  );
}
