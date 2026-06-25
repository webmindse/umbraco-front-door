import { createContext, useContext, type ReactNode } from "react";

import type { BrandId, BrandModule } from "./types";
import { defaultBrand } from "./default";
import { altBrand } from "./alt";

const brands: Record<BrandId, BrandModule> = {
  default: defaultBrand,
  alt: altBrand,
};

const BrandContext = createContext<BrandModule>(defaultBrand);

export function BrandProvider({
  brand,
  children,
}: {
  brand: BrandId;
  children: ReactNode;
}) {
  return (
    <BrandContext.Provider value={brands[brand]}>{children}</BrandContext.Provider>
  );
}

export function useBrand(): BrandModule {
  return useContext(BrandContext);
}

export function getBrand(id: BrandId): BrandModule {
  return brands[id];
}
