import { Link } from "@tanstack/react-router";

import type { ContentItem } from "@/integrations/umbraco/types";

interface BreadcrumbsProps {
  site: ContentItem;
  navItems: ContentItem[];
  currentPage: ContentItem;
}

interface Crumb {
  name: string;
  path: string;
}

function trimSlash(p: string): string {
  return p.replace(/\/$/, "") || "/";
}

export function Breadcrumbs({ site, navItems, currentPage }: BreadcrumbsProps) {
  const rootPath = trimSlash(site.route?.path ?? "/");
  const currentPath = trimSlash(currentPage.route?.path ?? "/");

  if (currentPath === rootPath) return null;

  const byPath = new Map<string, string>();
  for (const it of navItems) {
    const p = it.route?.path;
    if (p) byPath.set(trimSlash(p), it.name);
  }
  byPath.set(currentPath, currentPage.name);

  // Build ancestor path chain from root → current
  const rel = currentPath.startsWith(rootPath)
    ? currentPath.slice(rootPath.length)
    : currentPath;
  const segments = rel.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ name: site.name, path: site.route?.path ?? "/" }];
  let acc = rootPath === "/" ? "" : rootPath;
  for (const seg of segments) {
    acc = `${acc}/${seg}`;
    const key = trimSlash(acc);
    crumbs.push({ name: byPath.get(key) ?? seg, path: acc });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="w-full border-b border-border bg-background-neutral"
    >
      <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.15em] text-text-grey sm:px-6 lg:px-8">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span aria-current="page" className="text-text-dark">
                  {c.name}
                </span>
              ) : (
                <Link to={c.path} className="hover:text-text-dark">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
