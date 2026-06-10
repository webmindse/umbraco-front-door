# Server-function proxy for Umbraco

All Umbraco Delivery API calls go through `createServerFn`. The API key lives in `process.env.UMBRACO_API_KEY` and is read **inside** `.handler()` so it never enters the client bundle.

## Server-only client

`src/integrations/umbraco/client.server.ts`:

```ts
const BASE = process.env.UMBRACO_BASE_URL!;
const API_KEY = process.env.UMBRACO_API_KEY!;

export async function umbracoFetch<T>(
  path: string,
  init: RequestInit & { startItem?: string; culture?: string } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Api-Key", API_KEY);
  headers.set("Accept", "application/json");
  if (init.startItem) headers.set("Start-Item", init.startItem);
  if (init.culture) headers.set("Accept-Language", init.culture);

  const res = await fetch(`${BASE}/umbraco/delivery/api/v2${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new Error(`Umbraco ${res.status} ${res.statusText} for ${path}`);
  }
  return res.json() as Promise<T>;
}
```

Filename ends in `.server.ts` so it's blocked from client bundles.

## Server functions

`src/lib/umbraco.functions.ts` (NOT under `src/server/` — that path is blocked from client imports by the template):

```ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { umbracoFetch } from "@/integrations/umbraco/client.server";
import type { components } from "@/integrations/umbraco/types";

type ContentItem = components["schemas"]["IApiContentResponseModel"];

export const getContentByRoute = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ path: z.string() }).parse(data))
  .handler(async ({ data }): Promise<ContentItem | null> => {
    try {
      return await umbracoFetch<ContentItem>(
        `/content/item${data.path.startsWith("/") ? data.path : `/${data.path}`}`,
      );
    } catch (err) {
      if (String(err).includes("404")) return null;
      throw err;
    }
  });

export const getContentById = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(({ data }) =>
    umbracoFetch<ContentItem>(`/content/item/${data.id}`),
  );

export const getChildren = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(({ data }) =>
    umbracoFetch<{ items: ContentItem[] }>(
      `/content?fetch=children:${data.id}`,
    ),
  );
```

## Calling from routes

Server functions that require auth must follow `auth-protected-server-functions` rules. Umbraco calls here are **not** user-auth-gated, so they're safe to call from public route loaders:

```ts
// src/routes/$.tsx
export const Route = createFileRoute("/$")({
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["umbraco", "route", params._splat],
      queryFn: () => getContentByRoute({ data: { path: `/${params._splat ?? ""}` } }),
    }),
  component: DynamicPage,
});
```

## Rules

- Read `process.env.UMBRACO_*` only inside `.handler()`, never at module scope.
- Never import `client.server.ts` from a component or route file directly — go through `*.functions.ts`.
- Return plain DTOs only (no `Response`, no streams).
- For 404s from Umbraco, return `null` and let the route throw `notFound()`.
- Log full provider errors server-side; surface a generic message to the client.
