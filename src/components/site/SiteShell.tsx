import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { inferCultureFromPath, otherCulture, type Culture } from "@/lib/culture";
import type { ContentItem } from "@/integrations/umbraco/types";

import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { buildNavTree } from "./NavLevel";
import { navQueryOptions, siteQueryOptions } from "./site-data";

interface SiteShellProps {
  children: ReactNode;
  /** The current page's content item, used by the language picker to switch to
   *  the equivalent route in the other culture. */
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
  const nav = buildNavTree(navResp.items ?? [], rootPath);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader
        site={site}
        otherSite={otherSiteData ?? null}
        nav={nav}
        culture={culture}
        currentPage={currentPage ?? null}
        fallbackRoutes={fallbackRoutes}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </div>
  );
}
