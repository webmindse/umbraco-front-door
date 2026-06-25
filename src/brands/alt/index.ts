import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { blockRegistry, silentBlockAliases } from "./registry";

import type { BrandModule } from "../types";

export const altBrand: BrandModule = {
  id: "alt",
  SiteHeader: SiteHeader as unknown as BrandModule["SiteHeader"],
  SiteFooter: SiteFooter as unknown as BrandModule["SiteFooter"],
  blockRegistry,
  silentBlockAliases,
};
