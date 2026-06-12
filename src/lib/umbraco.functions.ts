import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { umbracoFetch } from "@/integrations/umbraco/client.server";
import type { ContentItem, ContentResponse } from "@/integrations/umbraco/types";

const routeInput = z.object({
  path: z.string().min(1),
  culture: z.string().optional(),
  preview: z.boolean().optional(),
});

/** Resolve a CMS route (URL path) to a content item. Returns null on 404. */
export const getContentByRoute = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => routeInput.parse(data))
  .handler(async ({ data }): Promise<ContentItem | null> => {
    const path = data.path.startsWith("/") ? data.path : `/${data.path}`;
    try {
      return await umbracoFetch<ContentItem>(`/content/item${path}`, {
        culture: data.culture,
        preview: data.preview,
      });
    } catch (err) {
      if (String(err).includes("404")) return null;
      throw err;
    }
  });

const idInput = z.object({
  id: z.string().uuid(),
  culture: z.string().optional(),
  preview: z.boolean().optional(),
});

export const getContentById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(({ data }) =>
    umbracoFetch<ContentItem>(`/content/item/${data.id}`, {
      culture: data.culture,
      preview: data.preview,
    }),
  );

export const getChildren = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => idInput.parse(data))
  .handler(({ data }) =>
    umbracoFetch<ContentResponse>(`/content?fetch=children:${data.id}`, {
      culture: data.culture,
      preview: data.preview,
    }),
  );

const byTypeInput = z.object({
  contentType: z.string().min(1),
  take: z.number().int().min(1).max(100).optional(),
  skip: z.number().int().min(0).optional(),
  culture: z.string().optional(),
  preview: z.boolean().optional(),
});

export const getByContentType = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => byTypeInput.parse(data))
  .handler(({ data }) => {
    const params = new URLSearchParams();
    params.set("filter", `contentType:${data.contentType}`);
    if (data.take) params.set("take", String(data.take));
    if (data.skip) params.set("skip", String(data.skip));
    return umbracoFetch<ContentResponse>(`/content?${params.toString()}`, {
      culture: data.culture,
      preview: data.preview,
    });
  });

/** Debug helper: returns the raw expanded payload for a route. */
export const debugGetRoute = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ path: z.string().default("/") }).parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<ContentItem | null> => {
    const path = data.path.startsWith("/") ? data.path : `/${data.path}`;
    try {
      return await umbracoFetch<ContentItem>(
        `/content/item${path}?expand=properties[$all]`,
      );
    } catch (err) {
      if (String(err).includes("404")) return null;
      throw err;
    }
  });
