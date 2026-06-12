import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import type { JsonObject } from "@/integrations/umbraco/types";

export interface UmbracoLinkPickerItem {
  url?: string;
  title?: string;
  target?: string | null;
  linkType?: "Content" | "External" | "Media" | string;
  destinationId?: string | null;
  destinationType?: string | null;
  route?: { path: string } | null;
  queryString?: string | null;
}

interface UmbracoLinkProps {
  link: UmbracoLinkPickerItem | JsonObject | null | undefined;
  children?: ReactNode;
  className?: string;
}

function getHref(link: UmbracoLinkPickerItem): string | null {
  if (link.route?.path) return link.route.path + (link.queryString ?? "");
  if (link.url) return link.url;
  return null;
}

export function UmbracoLink({ link, children, className }: UmbracoLinkProps) {
  if (!link) return <>{children}</>;
  const item = link as UmbracoLinkPickerItem;
  const href = getHref(item);
  if (!href) return <>{children}</>;

  const label = children ?? item.title ?? href;
  const isExternal =
    item.linkType === "External" || /^https?:\/\//i.test(href) || item.linkType === "Media";

  if (isExternal) {
    return (
      <a
        href={href}
        target={item.target ?? "_blank"}
        rel="noopener noreferrer"
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}
