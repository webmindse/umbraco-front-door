import { createContext, useContext, type ReactNode } from "react";

import type { BrandId, BrandModule } from "./types";
import { defaultBrand } from "./default";
import { altBrand } from "./alt";
import { variant2Brand } from "./variant2";

const brands: Record<BrandId, BrandModule> = {
  default: defaultBrand,
  alt: altBrand,
  variant2: variant2Brand,
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
