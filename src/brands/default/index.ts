import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  blockRegistry,
  silentBlockAliases,
} from "@/components/umbraco/blocks/registry";

import type { BrandModule, SiteFooterLikeProps, SiteHeaderLikeProps } from "../types";

export const defaultBrand: BrandModule = {
  id: "default",
  SiteHeader: SiteHeader as unknown as BrandModule["SiteHeader"],
  SiteFooter: SiteFooter as unknown as BrandModule["SiteFooter"],
  blockRegistry,
  silentBlockAliases,
};

// Re-export the prop shapes so alt brand can match.
export type { SiteHeaderLikeProps, SiteFooterLikeProps };
