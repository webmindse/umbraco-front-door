import type { ComponentType } from "react";

import type { ContentItem } from "@/integrations/umbraco/types";

import type { BlockComponent } from "@/components/umbraco/blocks/registry";

export type BrandId = "default" | "alt" | "variant2";

export interface SiteHeaderLikeProps {
  site: ContentItem;
  otherSite: ContentItem | null;
  // Loose typing here so brand shells don't need to know each other's exact prop shape.
  nav: unknown;
  culture: "sv" | "en";
  currentPage: ContentItem | null;
  fallbackRoutes: Record<"sv" | "en", string>;
}

export interface SiteFooterLikeProps {
  site: ContentItem;
}

export interface BrandModule {
  id: BrandId;
  SiteHeader: ComponentType<SiteHeaderLikeProps>;
  SiteFooter: ComponentType<SiteFooterLikeProps>;
  blockRegistry: Record<string, BlockComponent>;
  silentBlockAliases: ReadonlySet<string>;
}

/**
 * Resolve the active brand from the site content item.
 *
 * `useAlternativeTheme` is an Umbraco dropdown string:
 *   - "Standard"    → default branding
 *   - "Variant one" → alt branding
 *   - "Variant two" → variant2 branding
 *
 * Older content may still send a boolean (true = alt) — we keep that for
 * backwards compatibility. Anything unrecognised falls back to default.
 */
export function resolveBrand(site: ContentItem | null | undefined): BrandId {
  const v = site?.properties?.useAlternativeTheme;
  if (v === true) return "alt";
  if (typeof v === "string") {
    const key = v.trim().toLowerCase();
    if (key === "variant one" || key === "variantone") return "alt";
    if (key === "variant two" || key === "varianttwo") return "variant2";
  }
  return "default";
}
