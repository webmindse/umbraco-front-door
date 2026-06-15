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

const cultureInput = z.object({ culture: z.string().optional() });

/**
 * Fetch the site/home node for a given culture. The `site` document is the
 * start item and carries global header/footer config + a `cultures` map for
 * the language picker.
 */
export const getSite = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => cultureInput.parse(data ?? {}))
  .handler(({ data }) =>
    umbracoFetch<ContentItem>("/content/item/", { culture: data.culture }),
  );

/**
 * Fetch all descendants of the site as a flat list, filtered to `page` docs.
 * Header nav and mobile drill-down are built from this single response.
 */
export const getNavigationDescendants = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ rootId: z.string().uuid(), culture: z.string().optional() }).parse(data),
  )
  .handler(({ data }) => {
    const params = new URLSearchParams();
    params.set("fetch", `descendants:${data.rootId}`);
    params.set("filter", "contentType:page");
    params.set("take", "200");
    return umbracoFetch<ContentResponse>(`/content?${params.toString()}`, {
      culture: data.culture,
    });
  });

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
