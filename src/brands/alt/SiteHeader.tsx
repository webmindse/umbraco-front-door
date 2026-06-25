import { Link } from "@tanstack/react-router";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import type { ContentItem } from "@/integrations/umbraco/types";
import type { Culture } from "@/lib/culture";

import { DesktopNavItem } from "@/components/site/DesktopNavItem";
import { LanguagePicker } from "@/components/site/LanguagePicker";
import { MobileNavSheet } from "@/components/site/MobileNavSheet";
import { type NavNode } from "@/components/site/NavLevel";

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

/**
 * Alt brand header.
 * Distinct from default: transparent-over-gradient bar, peach accent border,
 * coral-glow logo, display heading font, and a coral-tinted CTA strip.
 */
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
    <header className="sticky top-0 z-40 w-full border-b border-[color:var(--brand-alt-coral)]/30 bg-[color:var(--brand-alt-deep-indigo)]/95 text-[color:var(--brand-alt-peach)] backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={fallbackRoutes[culture]}
          className="flex items-center gap-3"
          aria-label={site.name}
        >
          {logo ? (
            <UmbracoImage
              media={logo}
              alt={logoAlt ?? site.name}
              height={40}
              className="h-10 w-auto drop-shadow-[0_0_12px_color-mix(in_oklab,var(--brand-alt-coral)_50%,transparent)]"
            />
          ) : (
            <span className="font-display text-2xl font-bold tracking-tight text-[color:var(--brand-alt-peach)]">
              {site.name}
            </span>
          )}
        </Link>

        <nav aria-label="Primary" className="hidden md:flex">
          <ul className="flex items-center gap-10 font-display text-[0.78rem] font-medium uppercase tracking-[0.18em]">
            {nav.map((node) => (
              <DesktopNavItem key={node.id} node={node} />
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
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
