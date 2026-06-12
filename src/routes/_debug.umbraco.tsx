import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { debugGetRoute } from "@/lib/umbraco.functions";

export const Route = createFileRoute("/_debug/umbraco")({
  head: () => ({ meta: [{ title: "Umbraco debug" }, { name: "robots", content: "noindex" }] }),
  component: UmbracoDebugPage,
});

function UmbracoDebugPage() {
  const [path, setPath] = useState("/sv/");
  const [submitted, setSubmitted] = useState("/sv/");
  const fetchRoute = useServerFn(debugGetRoute);
  const router = useRouter();

  const { data, isFetching, error } = useQuery({
    queryKey: ["umbraco-debug", submitted],
    queryFn: () => fetchRoute({ data: { path: submitted } }),
  });

  return (
    <div className="mx-auto max-w-4xl p-6 font-sans">
      <h1 className="text-2xl font-semibold">Umbraco Delivery API — debug</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Phase 1 connectivity check. Enter a CMS route path and inspect the raw
        expanded JSON response.
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(path);
          router.invalidate();
        }}
      >
        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm"
          placeholder="/sv/"
        />
        <button
          type="submit"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Fetch
        </button>
      </form>

      <div className="mt-4 text-sm">
        {isFetching && <p>Loading…</p>}
        {error && (
          <pre className="rounded bg-destructive/10 p-3 text-destructive">
            {String(error)}
          </pre>
        )}
        {data === null && !isFetching && <p>404 — no content at that route.</p>}
      </div>

      {data && (
        <pre className="mt-4 max-h-[70vh] overflow-auto rounded border bg-muted p-3 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
