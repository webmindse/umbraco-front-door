import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SiteShell } from "@/components/site/SiteShell";
import { PageRenderer } from "@/components/umbraco/PageRenderer";
import { getContentByRoute } from "@/lib/umbraco.functions";
import type { ContentItem } from "@/integrations/umbraco/types";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { extractFaviconUrl, siteQueryOptions } from "@/components/site/site-data";
import { inferCultureFromPath } from "@/lib/culture";

type PageFetcher = (args: { data: { path: string } }) => Promise<ContentItem | null>;

const HOME_PATH = "/";

function homeQueryOptions(fetcher: PageFetcher) {
  return queryOptions({
    queryKey: ["umbraco-page", HOME_PATH],
    queryFn: async () => {
      const data = await fetcher({ data: { path: HOME_PATH } });
      if (!data) throw notFound();
      return data;
    },
  });
}

export const Route = createFileRoute("/")({
  head: ({ loaderData }) => {
    const data = loaderData as { page?: ContentItem; favicon?: string | null } | undefined;
    const name = data?.page?.name ?? "Bricks";
    return {
      meta: [
        { title: name },
        { name: "description", content: `${name} — Bricks` },
      ],
      links: data?.favicon ? [{ rel: "icon", href: data.favicon }] : [],
    };
  },
  loader: async ({ context }) => {
    const data = await (getContentByRoute as unknown as PageFetcher)({
      data: { path: HOME_PATH },
    });
    if (!data) throw notFound();
    await context.queryClient.prefetchQuery(
      homeQueryOptions(getContentByRoute as unknown as PageFetcher),
    );
    const culture = inferCultureFromPath(data.route?.path ?? HOME_PATH);
    const site = await context.queryClient
      .ensureQueryData(
        siteQueryOptions(culture, {
          siteId: data.route?.startItem?.id ?? null,
          path: HOME_PATH,
        }),
      )
      .catch(() => null);
    return { page: data, favicon: extractFaviconUrl(site) };
  },
  component: HomePage,
  notFoundComponent: HomeNotFound,
  errorComponent: HomeError,
});

function HomePage() {
  const fetcher = useServerFn(getContentByRoute) as unknown as PageFetcher;
  const { data } = useSuspenseQuery(homeQueryOptions(fetcher));

  return (
    <SiteShell currentPage={data}>
      <PageRenderer page={data} />
    </SiteShell>
  );
}

function HomeNotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="mt-4 text-muted-foreground">No home content found.</p>
      </div>
    </SiteShell>
  );
}

function HomeError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "umbraco_home" });
  }, [error]);
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </SiteShell>
  );
}
