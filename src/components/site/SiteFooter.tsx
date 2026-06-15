import { MapPin, Phone, Mail } from "lucide-react";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import type { ContentItem, BlockItem } from "@/integrations/umbraco/types";

interface SiteFooterProps {
  site: ContentItem;
}

interface FooterNavItem extends BlockItem {
  content: {
    contentType: string;
    id: string;
    properties: {
      title: string | null;
      link: UmbracoLinkPickerItem[];
    };
  };
}

function getMedia(prop: unknown): UmbracoMediaLike | null {
  if (Array.isArray(prop) && prop.length > 0) return prop[0] as UmbracoMediaLike;
  return null;
}

function getNavItems(prop: unknown): FooterNavItem[] {
  const v = prop as { items?: FooterNavItem[] } | null | undefined;
  return v?.items ?? [];
}

function FooterNavList({ items }: { items: FooterNavItem[] }) {
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {items.map((it) => {
        const link = it.content.properties.link?.[0];
        const label = it.content.properties.title ?? link?.title ?? "";
        if (!link) return null;
        return (
          <li key={it.content.id}>
            <UmbracoLink link={link} className="hover:underline">
              {label}
            </UmbracoLink>
          </li>
        );
      })}
    </ul>
  );
}

export function SiteFooter({ site }: SiteFooterProps) {
  const props = site.properties ?? {};
  const footerLogo = getMedia(props.footerLogo);
  const copyright = (props.copyrightText as string | undefined) ?? "";
  const mainNav = getNavItems(props.mainNavigation);
  const secondaryNav = getNavItems(props.secondaryNavigation);
  const secondaryTitle = props.secondaryNavigationTitle as string | undefined;
  const contactTitle = props.contactInfoTitle as string | undefined;
  const address = props.address as string | undefined;
  const phone = props.phone as string | undefined;
  const email = props.eMail as string | undefined;

  return (
    <footer className="mt-24 w-full bg-background-secondary text-text-light">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Top row: logo + copyright | mainNavigation */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            {footerLogo ? (
              <UmbracoImage
                media={footerLogo}
                alt={site.name}
                height={48}
                className="h-12 w-auto"
              />
            ) : null}
            {copyright ? (
              <p className="text-xs opacity-80">{copyright}</p>
            ) : null}
          </div>
          {mainNav.length > 0 ? (
            <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-2 text-sm font-medium uppercase tracking-wider">
              {mainNav.map((it) => {
                const link = it.content.properties.link?.[0];
                const label = it.content.properties.title ?? link?.title ?? "";
                if (!link) return null;
                return (
                  <UmbracoLink
                    key={it.content.id}
                    link={link}
                    className="hover:underline"
                  >
                    {label}
                  </UmbracoLink>
                );
              })}
            </nav>
          ) : null}
        </div>

        {/* Bottom row: contact info | secondary navigation */}
        <div className="mt-12 grid gap-12 border-t border-text-light/10 pt-12 md:grid-cols-2">
          <div>
            {contactTitle ? (
              <h2 className="text-lg font-semibold text-text-light">
                {contactTitle}
              </h2>
            ) : null}
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              {address ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="whitespace-pre-line">{address}</span>
                </li>
              ) : null}
              {phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`tel:${phone}`} className="hover:underline">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:underline">
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          {secondaryNav.length > 0 ? (
            <div>
              {secondaryTitle ? (
                <h2 className="text-lg font-semibold text-text-light">
                  {secondaryTitle}
                </h2>
              ) : null}
              <div className="mt-4">
                <FooterNavList items={secondaryNav} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
