import type { ComponentType } from "react";

import type { ContentItem } from "@/integrations/umbraco/types";

import type { BlockComponent } from "@/components/umbraco/blocks/registry";

export type BrandId = "default" | "alt";

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
 * Resolve the active brand from the site content item. Reads
 * `properties.useAlternativeTheme` (boolean). Defaults to "default".
 */
export function resolveBrand(site: ContentItem | null | undefined): BrandId {
  const v = site?.properties?.useAlternativeTheme;
  return v === true ? "alt" : "default";
}
