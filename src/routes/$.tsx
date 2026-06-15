import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SiteShell } from "@/components/site/SiteShell";
import { PageRenderer } from "@/components/umbraco/PageRenderer";
import { getContentByRoute } from "@/lib/umbraco.functions";
import type { ContentItem } from "@/integrations/umbraco/types";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type PageFetcher = (args: { data: { path: string } }) => Promise<ContentItem | null>;

function pageQueryOptions(path: string, fetcher: PageFetcher) {
  return queryOptions({
    queryKey: ["umbraco-page", path],
    queryFn: async () => {
      const data = await fetcher({ data: { path } });
      if (!data) throw notFound();
      return data;
    },
  });
}

export const Route = createFileRoute("/$")({
  head: ({ loaderData }) => {
    const name = (loaderData as ContentItem | undefined)?.name ?? "Bricks";
    return {
      meta: [
        { title: name },
        { name: "description", content: `${name} — Bricks` },
      ],
    };
  },
  loader: async ({ context, params }) => {
    const path = `/${(params as { _splat?: string })._splat ?? ""}`;
    const data = await (getContentByRoute as unknown as PageFetcher)({ data: { path } });
    if (!data) throw notFound();
    await context.queryClient.prefetchQuery(
      pageQueryOptions(path, getContentByRoute as unknown as PageFetcher),
    );
    return data;
  },
  component: CatchAllPage,
  notFoundComponent: PageNotFound,
  errorComponent: PageError,
});

function CatchAllPage() {
  const params = Route.useParams() as { _splat?: string };
  const path = `/${params._splat ?? ""}`;
  const fetcher = useServerFn(getContentByRoute) as unknown as PageFetcher;
  const { data } = useSuspenseQuery(pageQueryOptions(path, fetcher));

  return (
    <SiteShell currentPage={data}>
      <PageRenderer page={data} />
    </SiteShell>
  );
}

function PageNotFound() {
  const params = Route.useParams() as { _splat?: string };
  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-5xl font-semibold">404</h1>
        <p className="mt-4 text-muted-foreground">
          No content at <code>/{params._splat ?? ""}</code>.
        </p>
      </div>
    </SiteShell>
  );
}

function PageError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "umbraco_catch_all" });
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
