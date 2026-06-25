import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

import {
  blockRegistry,
  silentBlockAliases,
} from "@/components/umbraco/blocks/registry";

import type { BrandModule } from "../types";

/**
 * Variant two brand.
 *
 * Re-uses the default SiteHeader / SiteFooter and the default block
 * components — they consume semantic CSS tokens (--primary,
 * --background-secondary, --text-light, etc.), which are remapped under
 * `[data-brand="variant2"]` in src/styles.css. That alone gives the
 * variant a distinct palette + typography without duplicating layout code.
 */
export const variant2Brand: BrandModule = {
  id: "variant2",
  SiteHeader: SiteHeader as unknown as BrandModule["SiteHeader"],
  SiteFooter: SiteFooter as unknown as BrandModule["SiteFooter"],
  blockRegistry,
  silentBlockAliases,
};
