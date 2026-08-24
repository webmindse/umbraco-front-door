/**
 * Culture helpers. Each root node (`site`) is served in two cultures: `sv`
 * (default) and `en`. Paths look like `/en/...` for the default root and
 * `/<root>/sv/...` / `/<root>/en/...` for additional roots, so the culture
 * is detected from any `sv`/`en` path segment rather than a fixed prefix.
 */
export type Culture = "sv" | "en";

export const DEFAULT_CULTURE: Culture = "sv";
export const SUPPORTED_CULTURES: Culture[] = ["sv", "en"];

export function inferCultureFromPath(pathname: string): Culture {
  const segments = pathname.split("/").filter(Boolean);
  for (const seg of segments) {
    const s = seg.toLowerCase();
    if (s === "en") return "en";
    if (s === "sv") return "sv";
  }
  return DEFAULT_CULTURE;
}

export function otherCulture(c: Culture): Culture {
  return c === "sv" ? "en" : "sv";
}
