import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";

import {
  UmbracoImage,
  type UmbracoMediaLike,
} from "@/components/umbraco/UmbracoImage";
import { Button } from "@/components/ui/button";
import { getContentById } from "@/lib/umbraco.functions";
import { inferCultureFromPath } from "@/lib/culture";
import type { ContentItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface PickedNode {
  id: string;
  name: string;
  contentType: string;
  route?: { path: string } | null;
}

interface NodePickerContent {
  nodes?: PickedNode[] | null;
  defaultImage?: UmbracoMediaLike[] | null;
}

interface NodePickerSettings {
  anchorId?: string | null;
}

/** Listing-tab properties on the picked page. */
interface NodeListingProps {
  image?: UmbracoMediaLike[] | null;
  title?: string | null;
  description?: string | null;
}

type ByIdFetcher = (args: {
  data: { id: string; culture: string };
}) => Promise<ContentItem>;

export default function NodePicker({ content, settings }: BlockComponentProps) {
  const { nodes, defaultImage } = content as unknown as NodePickerContent;
  const s = (settings ?? {}) as unknown as NodePickerSettings;

  const list = useMemo(() => nodes ?? [], [nodes]);
  const fallbackImage = defaultImage?.[0] ?? null;

  // The picked nodes arrive with empty `properties`, so fetch each page to
  // read its Listing tab (image / title / description).
  const results = useQueries({
    queries: list.map((node) => ({
      queryKey: ["umbraco-node", node.id] as const,
      queryFn: () =>
        (getContentById as unknown as ByIdFetcher)({
          data: {
            id: node.id,
            culture: inferCultureFromPath(node.route?.path ?? "/"),
          },
        }),
      enabled: Boolean(node.id),
      staleTime: 60_000,
    })),
  });

  if (!list.length) return null;

  return (
    <section
      id={s.anchorId ?? undefined}
      className="w-full px-6 md:px-12"
    >
      <div
        className={cn(
          "mx-auto grid w-full max-w-6xl gap-6",
          list.length === 1
            ? "grid-cols-1"
            : list.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {list.map((node, i) => {
          const item = results[i]?.data;
          const p = (item?.properties ?? {}) as unknown as NodeListingProps;
          const media = p.image?.[0] ?? fallbackImage;
          const title = p.title || item?.name || node.name;
          const description = p.description ?? null;
          const href = item?.route?.path ?? node.route?.path ?? "/";

          return (
            <Link
              key={node.id}
              to={href}
              className="group flex h-full flex-col overflow-hidden bg-card text-card-foreground no-underline shadow-sm transition hover:shadow-lg"
            >
              {media ? (
                <div className="relative aspect-[3/2] w-full overflow-hidden">
                  <UmbracoImage
                    media={media}
                    width={880}
                    fill
                    alt={media.name}
                    className="transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-6 md:p-8">
                <h3 className="font-display text-2xl tracking-tight">{title}</h3>
                {description ? (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                ) : null}
                <div className="mt-auto flex pt-6">
                  <Button type="button" variant="outline" asChild size="default">
                    <span>Läs mer</span>
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
