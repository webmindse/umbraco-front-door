import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { umbracoFetch } from "@/integrations/umbraco/client.server";
import type { ContentResponse } from "@/integrations/umbraco/types";

export const testNavFetch = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ rootId: z.string().uuid(), culture: z.string().optional(), mode: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    if (data.mode === "children") {
      params.set("fetch", `children:${data.rootId}`);
      params.set("filter", "contentType:page");
    } else if (data.mode === "descendants") {
      params.set("fetch", `descendants:${data.rootId}`);
      params.set("filter", "contentType:page");
    } else if (data.mode === "descendants-feed") {
      params.set("fetch", `descendants:${data.rootId}`);
      params.set("filter", "contentType:page,feed");
    } else if (data.mode === "descendants-feed-or") {
      params.set("fetch", `descendants:${data.rootId}`);
      params.set("filter", "contentType:page|feed");
    } else if (data.mode === "descendants-no-filter") {
      params.set("fetch", `descendants:${data.rootId}`);
    }
    params.set("take", "200");
    const url = `/content?${params.toString()}`;
    const result = await umbracoFetch<ContentResponse>(url, { culture: data.culture });
    return { url, total: result.total, items: result.items.map(i => ({ id: i.id, name: i.name, contentType: i.contentType, path: i.route?.path })) };
  });
