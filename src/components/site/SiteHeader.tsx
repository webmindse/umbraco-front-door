import { Link } from "@tanstack/react-router";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import type { ContentItem } from "@/integrations/umbraco/types";
import type { Culture } from "@/lib/culture";

import { DesktopNavItem } from "./DesktopNavItem";
import { LanguagePicker } from "./LanguagePicker";
import { MobileNavSheet } from "./MobileNavSheet";
import { type NavNode } from "./NavLevel";

interface SiteHeaderProps {
  site: ContentItem;
  otherSite: ContentItem | null;
  nav: NavNode[];
  culture: Culture;
  currentPage: ContentItem | null;
  fallbackRoutes: Record<Culture, string>;
}

function getMedia(prop: unknown): UmbracoMediaLike | null {
  if (Array.isArray(prop) && prop.length > 0) return prop[0] as UmbracoMediaLike;
  return null;
}

function getCultureRoutes(
  page: ContentItem | null,
): Partial<Record<Culture, string>> {
  const c = (page?.cultures ?? {}) as Record<string, { path?: string } | undefined>;
  const out: Partial<Record<Culture, string>> = {};
  if (c.sv?.path) out.sv = c.sv.path;
  if (c.en?.path) out.en = c.en.path;
  return out;
}

export function SiteHeader({
  site,
  otherSite,
  nav,
  culture,
  currentPage,
  fallbackRoutes,
}: SiteHeaderProps) {
  const props = site.properties ?? {};
  const logo = getMedia(props.logoOnDark);
  const logoName = (logo?.properties as Record<string, string> | undefined) ?? {};
  const logoAlt = culture === "sv" ? logoName.swedishAlt : logoName.englishAlt;

  const currentFlag = getMedia(props.languageFlag);
  const currentFlagAlt =
    (props.altTextForLanguageFlag as string | undefined) ??
    (currentFlag?.properties as Record<string, string> | undefined)?.englishAlt;
  const currentLanguageName = props.languageDisplayName as string | undefined;

  const otherProps = otherSite?.properties ?? {};
  const otherFlag = getMedia(otherProps.languageFlag);
  const otherFlagAlt =
    (otherProps.altTextForLanguageFlag as string | undefined) ??
    (otherFlag?.properties as Record<string, string> | undefined)?.englishAlt;
  const otherLanguageName = otherProps.languageDisplayName as string | undefined;


  return (
    <header className="sticky top-0 z-40 w-full bg-nav-background text-text-light">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to={fallbackRoutes[culture]} className="flex items-center" aria-label={site.name}>
          {logo ? (
            <UmbracoImage
              media={logo}
              alt={logoAlt ?? site.name}
              height={36}
              className="h-9 w-auto"
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight">{site.name}</span>
          )}
        </Link>

        <nav aria-label="Primary" className="hidden gap-8 text-sm font-medium uppercase tracking-wider md:flex">
          {nav.map((node) => {
            const isActive = pathname === node.path || pathname.startsWith(node.path);
            return (
              <Link
                key={node.id}
                to={node.path}
                className={
                  isActive
                    ? "text-text-light"
                    : "text-text-light/80 hover:text-text-light"
                }
              >
                {node.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguagePicker
              culture={culture}
              otherFlag={otherFlag}
              otherFlagAlt={otherFlagAlt}
              otherLanguageName={otherLanguageName}
              cultureRoutes={getCultureRoutes(currentPage)}
              fallbackRoutes={fallbackRoutes}
            />
          </div>
          <MobileNavSheet
            nav={nav}
            logo={getMedia(props.logoOnLight)}
            logoAlt={logoAlt}
            language={{
              culture,
              otherFlag,
              otherFlagAlt,
              otherLanguageName,
              cultureRoutes: getCultureRoutes(currentPage),
              fallbackRoutes,
            }}
          />
        </div>
      </div>
    </header>
  );
}
