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
    <header className="sticky top-0 z-40 w-full bg-nav-background text-nav-foreground">
      <div className="relative">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 px-4 sm:px-6 lg:h-20 lg:grid-cols-[auto_minmax(0,1fr)] lg:px-8">
          <Link
            to={fallbackRoutes[culture]}
            className="flex shrink-0 items-center"
            aria-label={site.name}
          >
            {logo ? (
              <UmbracoImage
                media={logo}
                alt={logoAlt ?? site.name}
                height={40}
                className="h-9 w-auto max-w-[180px] object-contain lg:h-10"
              />
            ) : (
              <span className="text-lg font-semibold tracking-tight">{site.name}</span>
            )}
          </Link>

          <nav
            aria-label="Primary"
            className="hidden min-w-0 items-center justify-end gap-6 lg:flex xl:gap-9"
          >
            <ul className="flex min-w-0 items-center gap-6 text-[0.95rem] font-medium tracking-normal xl:gap-9">
              {nav.map((node) => (
                <DesktopNavItem key={node.id} node={node} />
              ))}
            </ul>
            <LanguagePicker
              culture={culture}
              currentFlag={currentFlag}
              currentFlagAlt={currentFlagAlt}
              currentLanguageName={currentLanguageName}
              otherFlag={otherFlag}
              otherFlagAlt={otherFlagAlt}
              otherLanguageName={otherLanguageName}
              cultureRoutes={getCultureRoutes(currentPage)}
              fallbackRoutes={fallbackRoutes}
            />
          </nav>

          <div className="col-start-3 flex shrink-0 items-center justify-end gap-2 lg:hidden">
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
      </div>
    </header>
  );
}

