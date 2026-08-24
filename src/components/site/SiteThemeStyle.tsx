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

function isColor(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildSiteThemeCss(site: ContentItem | null | undefined): string {
  const props = (site?.properties ?? {}) as Record<string, unknown>;
  const decls: string[] = [];

  for (const [prop, cssVars] of COLOR_MAP) {
    const value = props[prop];
    if (!isColor(value)) continue;
    for (const cssVar of cssVars) decls.push(`${cssVar}: ${value.trim()};`);
  }

  if (!decls.length) return "";
  return `:root{${decls.join("")}}`;
}

/**
 * Renders the site's CMS-driven colour palette as inline CSS variables.
 */
export function SiteThemeStyle({ site }: { site: ContentItem | null | undefined }) {
  const css = buildSiteThemeCss(site);
  if (!css) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
