import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { inferCultureFromPath, otherCulture, type Culture } from "@/lib/culture";
import type { ContentItem } from "@/integrations/umbraco/types";
import { BrandProvider } from "@/brands/BrandContext";
import { resolveBrand } from "@/brands/types";
import { getBrand } from "@/brands/BrandContext";

import { Breadcrumbs } from "./Breadcrumbs";
import { buildNavTree } from "./NavLevel";
import { navQueryOptions, siteQueryOptions } from "./site-data";

interface SiteShellProps {
  children: ReactNode;
  currentPage?: ContentItem | null;
}

function getCultureFallbackRoutes(site: ContentItem): Record<Culture, string> {
  const c = (site.cultures ?? {}) as Record<
    string,
    { path?: string } | undefined
  >;
  return {
    sv: c.sv?.path ?? "/",
    en: c.en?.path ?? "/en/",
  };
}

export function SiteShell({ children, currentPage }: SiteShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const culture: Culture = inferCultureFromPath(pathname);
  const other = otherCulture(culture);

  const { data: site } = useSuspenseQuery(siteQueryOptions(culture));
  const { data: otherSiteData } = useSuspenseQuery(siteQueryOptions(other));
  const { data: navResp } = useSuspenseQuery(navQueryOptions(culture, site.id));

  const fallbackRoutes = getCultureFallbackRoutes(site);
  const rootPath = site.route?.path ?? fallbackRoutes[culture];
  const navItems = navResp.items ?? [];
  const nav = buildNavTree(navItems, rootPath);

  const brandId = resolveBrand(site);
  const brand = getBrand(brandId);
  const { SiteHeader, SiteFooter } = brand;

  // Reflect active brand on <html> so token overrides apply globally.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-brand", brandId);
  }, [brandId]);

  const hideBreadcrumbs =
    (currentPage?.properties?.hideBreadcrumbs as boolean | undefined) === true;
  const showBreadcrumbs = Boolean(currentPage) && !hideBreadcrumbs;

  return (
    <BrandProvider brand={brandId}>
      <div
        data-brand={brandId}
        className="flex min-h-screen flex-col bg-background text-foreground"
      >
        <SiteHeader
          site={site}
          otherSite={otherSiteData ?? null}
          nav={nav as never}
          culture={culture}
          currentPage={currentPage ?? null}
          fallbackRoutes={fallbackRoutes}
        />
        {showBreadcrumbs && currentPage ? (
          <Breadcrumbs site={site} navItems={navItems} currentPage={currentPage} />
        ) : null}
        <main className="flex-1">{children}</main>
        <SiteFooter site={site} />
      </div>
    </BrandProvider>
  );
}
