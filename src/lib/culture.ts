/**
 * Culture helpers. The site has two cultures: `sv` (default, served at `/`)
 * and `en` (served at `/en/...`). Swedish is the default — anything not
 * under `/en` is treated as Swedish.
 */
export type Culture = "sv" | "en";

export const DEFAULT_CULTURE: Culture = "sv";
export const SUPPORTED_CULTURES: Culture[] = ["sv", "en"];

export function inferCultureFromPath(pathname: string): Culture {
  if (/^\/en(\/|$)/i.test(pathname)) return "en";
  return DEFAULT_CULTURE;
}

export function otherCulture(c: Culture): Culture {
  return c === "sv" ? "en" : "sv";
}
