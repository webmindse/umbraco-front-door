import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import type { NavNode } from "./NavLevel";

interface DesktopNavItemProps {
  node: NavNode;
  depth?: number;
}

function useIsActive(path: string) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === path || pathname.startsWith(`${path}/`);
}

/** Third level rendered as a plain list inside a mega-panel column. */
function MegaLeaf({ node }: { node: NavNode }) {
  const isActive = useIsActive(node.path);
  return (
    <li>
      <Link
        to={node.path}
        data-active={isActive ? "true" : "false"}
        className="block py-1 text-sm text-nav-secondary-foreground/70 transition-colors hover:text-nav-secondary-foreground data-[active=true]:text-nav-secondary-foreground"
      >
        {node.name}
      </Link>
    </li>
  );
}

/** Second level: a column heading inside the mega-panel. */
function MegaColumn({ node }: { node: NavNode }) {
  const isActive = useIsActive(node.path);
  return (
    <li className="min-w-0">
      <Link
        to={node.path}
        data-active={isActive ? "true" : "false"}
        className="block border-b border-current/15 pb-2 text-[0.95rem] font-semibold text-nav-secondary-foreground transition-colors hover:text-nav-secondary-foreground"
      >
        {node.name}
      </Link>
      {node.children.length > 0 ? (
        <ul className="mt-2 space-y-0.5">
          {node.children.map((c) => (
            <MegaLeaf key={c.id} node={c} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DesktopNavItem({ node }: DesktopNavItemProps) {
  const isActive = useIsActive(node.path);
  const hasChildren = node.children.length > 0;
  const columns = Math.min(node.children.length, 3);

  return (
    <li className="group/nav static">
      <div className="flex items-center gap-1">
        <Link
          to={node.path}
          data-active={isActive ? "true" : "false"}
          className="nav-link-underline py-2 text-nav-foreground/90 hover:text-nav-foreground"
        >
          {node.name}
        </Link>
        {hasChildren ? (
          <ChevronDown
            className="h-4 w-4 text-nav-foreground/70 transition-transform group-hover/nav:rotate-180"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {hasChildren ? (
        <div
          role="menu"
          className="invisible absolute inset-x-0 top-full z-50 translate-y-1 bg-nav-secondary-background opacity-0 shadow-xl transition duration-200 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
        >
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <ul
              className="grid gap-x-10 gap-y-6"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {node.children.map((c) => (
                <MegaColumn key={c.id} node={c} />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
