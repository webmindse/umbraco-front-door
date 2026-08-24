import type { ContentItem } from "@/integrations/umbraco/types";

/**
 * Maps the colour properties on the Umbraco `site` document type onto the
 * design-system CSS custom properties. Empty/missing values fall through to
 * the defaults defined in src/styles.css.
 */
const COLOR_MAP: Array<[prop: string, cssVars: string[]]> = [
  ["primary", ["--primary", "--ring"]],
  ["primaryContrast", ["--primary-foreground", "--primary-contrast"]],
  ["secondary", ["--secondary"]],
  ["secondaryContrast", ["--secondary-foreground"]],
  ["backgroundPrimary", ["--background-primary"]],
  ["backgroundPrimaryContrast", ["--background-primary-contrast"]],
  ["backgroundSecondary", ["--background-secondary"]],
  ["backgroundSecondaryContrast", ["--background-secondary-contrast"]],
  ["bodyBackground", ["--background"]],
  ["navigationPrimaryBackground", ["--nav-background"]],
  ["navigationPrimaryText", ["--nav-foreground"]],
  ["navigationSecondaryBackground", ["--nav-secondary-background"]],
  ["navigationSecondaryText", ["--nav-secondary-foreground"]],
  ["gradientLeft", ["--gradient-left"]],
  ["gradientRight", ["--gradient-right"]],
  ["links", ["--link"]],
];

/** Font family properties → CSS custom properties. */
const FONT_MAP: Array<[prop: string, cssVar: string]> = [
  ["bodyFont", "--body-font"],
  ["headingsFont", "--heading-font"],
];

function isColor(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** CMS font values often end with a stray `;` — strip it. */
function normalizeFontStack(value: string): string {
  return value.trim().replace(/;+\s*$/, "").trim();
}

/**
 * Pull stylesheet/preconnect hrefs out of the raw Google Fonts embed snippet
 * stored in the CMS. Only `fonts.googleapis.com` / `fonts.gstatic.com` URLs
 * are accepted so the snippet can't inject arbitrary resources.
 */
export function extractGoogleFontLinks(embed: unknown): string[] {
  if (typeof embed !== "string" || !embed.trim()) return [];
  const urls: string[] = [];
  for (const match of embed.matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
    const href = match[1]?.trim();
    if (!href) continue;
    if (!/^https:\/\/fonts\.(googleapis|gstatic)\.com\//i.test(href)) continue;
    if (!urls.includes(href)) urls.push(href);
  }
  return urls;
}

export function buildSiteThemeCss(site: ContentItem | null | undefined): string {
  const props = (site?.properties ?? {}) as Record<string, unknown>;
  const decls: string[] = [];

  for (const [prop, cssVars] of COLOR_MAP) {
    const value = props[prop];
    if (!isColor(value)) continue;
    for (const cssVar of cssVars) decls.push(`${cssVar}: ${value.trim()};`);
  }

  for (const [prop, cssVar] of FONT_MAP) {
    const value = props[prop];
    if (!isColor(value)) continue;
    const stack = normalizeFontStack(value);
    if (stack) decls.push(`${cssVar}: ${stack};`);
  }

  if (!decls.length) return "";
  return `:root{${decls.join("")}}`;
}

/**
 * Renders the site's CMS-driven colour palette + web fonts.
 */
export function SiteThemeStyle({ site }: { site: ContentItem | null | undefined }) {
  const css = buildSiteThemeCss(site);
  const fontLinks = extractGoogleFontLinks(site?.properties?.googleFontsEmbed);
  if (!css && !fontLinks.length) return null;
  return (
    <>
      {fontLinks.map((href) => (
        <link
          key={href}
          rel={href.includes("/css") ? "stylesheet" : "preconnect"}
          href={href}
          {...(href.includes("gstatic") ? { crossOrigin: "anonymous" as const } : {})}
        />
      ))}
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
    </>
  );
}

