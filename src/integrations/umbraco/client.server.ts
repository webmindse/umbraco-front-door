// Server-only Umbraco Delivery API client.
// Filename ends in `.server.ts` so it is excluded from client bundles.
// Never import this file from a component or route — go through
// `src/lib/umbraco.functions.ts`.

export interface UmbracoFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: HeadersInit;
  /** Forwarded as `Start-Item` header (defaults to env `UMBRACO_START_ITEM` if set). */
  startItem?: string;
  /** Forwarded as `Accept-Language` (e.g. `sv`, `en-US`). */
  culture?: string;
  /** Use preview endpoint instead of published. */
  preview?: boolean;
}

export async function umbracoFetch<T>(
  path: string,
  options: UmbracoFetchOptions = {},
): Promise<T> {
  const base = process.env.UMBRACO_BASE_URL;
  const apiKey = process.env.UMBRACO_API_KEY;
  if (!base) throw new Error("UMBRACO_BASE_URL is not set");
  if (!apiKey) throw new Error("UMBRACO_API_KEY is not set");

  const { startItem, culture, preview, headers: extraHeaders, ...init } = options;

  const headers = new Headers(extraHeaders);
  headers.set("Api-Key", apiKey);
  headers.set("Accept", "application/json");
  if (preview) headers.set("Preview", "true");
  const start = startItem ?? process.env.UMBRACO_START_ITEM;
  if (start) headers.set("Start-Item", start);
  if (culture) headers.set("Accept-Language", culture);

  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${normalizedBase}/umbraco/delivery/api/v2${normalizedPath}`;

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Log full provider error server-side; surface a generic message.
    console.error(
      `[umbraco] ${res.status} ${res.statusText} for ${normalizedPath}\n${body.slice(0, 500)}`,
    );
    throw new Error(`Umbraco ${res.status} for ${normalizedPath}`);
  }
  return (await res.json()) as T;
}

/** Resolve a relative media URL (e.g. `/media/.../foo.jpg`) against the CMS base. */
export function umbracoMediaUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.UMBRACO_BASE_URL?.replace(/\/+$/, "") ?? "";
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
