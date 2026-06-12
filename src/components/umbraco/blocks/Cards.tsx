import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";

import Card from "./Card";
import type { BlockComponentProps } from "./registry";

interface CardsContent {
  title?: string;
  text?: string;
  cardsList?: { items?: BlockItem[] };
}

export default function Cards({ content }: BlockComponentProps) {
  const { title, text, cardsList } = content as unknown as CardsContent;
  const items = cardsList?.items ?? [];

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto max-w-6xl">
        {(title || text) && (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {title ? (
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
            ) : null}
            {text ? (
              <p className="mt-4 text-base text-muted-foreground">{text}</p>
            ) : null}
          </div>
        )}

        {items.length ? (
          <div className="flex flex-wrap gap-6">
            {items.map((item) => (
              <Card
                key={item.content.id}
                content={(item.content.properties ?? {}) as JsonObject}
                settings={(item.settings?.properties ?? undefined) as JsonObject | undefined}
                block={item}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
