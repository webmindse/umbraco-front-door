import { MapPin, Phone, Mail } from "lucide-react";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import type { ContentItem } from "@/integrations/umbraco/types";

interface SiteFooterProps {
  site: ContentItem;
}

interface FooterNavItem {
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

/**
 * Alt brand footer.
 * Three-column dark layout with coral accent rules and peach text.
 */
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
    <footer
      className="mt-24 w-full text-[color:var(--brand-alt-peach)]"
      style={{
        background:
          "linear-gradient(180deg, var(--brand-alt-deep-indigo) 0%, #050118 100%)",
      }}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[color:var(--brand-alt-coral)] to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            {footerLogo ? (
              <UmbracoImage
                media={footerLogo}
                alt={site.name}
                height={56}
                className="h-14 w-auto"
              />
            ) : (
              <span className="font-display text-3xl font-bold tracking-tight">
                {site.name}
              </span>
            )}
            {copyright ? (
              <p className="text-xs text-[color:var(--brand-alt-peach)]/60">
                {copyright}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            {mainNav.length > 0 ? (
              <nav aria-label="Footer" className="flex flex-col gap-3 font-display text-sm uppercase tracking-[0.14em]">
                {mainNav.map((it) => {
                  const link = it.content.properties.link?.[0];
                  const label = it.content.properties.title ?? link?.title ?? "";
                  if (!link) return null;
                  return (
                    <UmbracoLink
                      key={it.content.id}
                      link={link}
                      className="w-fit border-b border-transparent transition-colors hover:border-[color:var(--brand-alt-coral)] hover:text-[color:var(--brand-alt-coral)]"
                    >
                      {label}
                    </UmbracoLink>
                  );
                })}
              </nav>
            ) : null}
            {secondaryNav.length > 0 ? (
              <div>
                {secondaryTitle ? (
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-alt-coral)]">
                    {secondaryTitle}
                  </h2>
                ) : null}
                <ul className="flex flex-col gap-2 text-sm text-[color:var(--brand-alt-peach)]/80">
                  {secondaryNav.map((it) => {
                    const link = it.content.properties.link?.[0];
                    const label = it.content.properties.title ?? link?.title ?? "";
                    if (!link) return null;
                    return (
                      <li key={it.content.id}>
                        <UmbracoLink link={link} className="hover:text-[color:var(--brand-alt-coral)]">
                          {label}
                        </UmbracoLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div>
            {contactTitle ? (
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-alt-coral)]">
                {contactTitle}
              </h2>
            ) : null}
            <ul className="flex flex-col gap-3 text-sm">
              {address ? (
                <li className="flex items-start gap-3 text-[color:var(--brand-alt-peach)]/85">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand-alt-coral)]" aria-hidden />
                  <span className="whitespace-pre-line">{address}</span>
                </li>
              ) : null}
              {phone ? (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-[color:var(--brand-alt-coral)]" aria-hidden />
                  <a href={`tel:${phone}`} className="hover:text-[color:var(--brand-alt-coral)]">
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-[color:var(--brand-alt-coral)]" aria-hidden />
                  <a href={`mailto:${email}`} className="hover:text-[color:var(--brand-alt-coral)]">
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
