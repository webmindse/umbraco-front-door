import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { NavNode } from "./NavLevel";

interface DesktopNavItemProps {
  node: NavNode;
  depth?: number;
}

export function DesktopNavItem({ node, depth = 0 }: DesktopNavItemProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hasChildren = node.children.length > 0;
  const isActive = pathname === node.path || pathname.startsWith(node.path);

  if (depth === 0) {
    return (
      <li className="group/nav relative">
        <div className="flex items-center gap-1">
          <Link
            to={node.path}
            data-active={isActive ? "true" : "false"}
            className="nav-link-underline py-2 text-text-light/90 hover:text-text-light"
          >
            {node.name}
          </Link>
          {hasChildren ? (
            <ChevronDown
              className="h-4 w-4 text-text-light/70 transition-transform group-hover/nav:rotate-180"
              aria-hidden="true"
            />
          ) : null}
        </div>
        {hasChildren ? (
          <ul
            role="menu"
            className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 bg-nav-background py-2 opacity-0 shadow-lg transition group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100"
          >
            {node.children.map((c) => (
              <DesktopNavItem key={c.id} node={c} depth={1} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li className="group/sub relative">
      <div className="flex items-stretch">
        <Link
          to={node.path}
          data-active={isActive ? "true" : "false"}
          className="flex-1 px-5 py-2.5 text-sm font-medium normal-case tracking-normal text-text-light/90 hover:bg-white/5 hover:text-text-light"
        >
          {node.name}
        </Link>
        {hasChildren ? (
          <span className="flex items-center pr-4 text-text-light/60">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {hasChildren ? (
        <ul
          role="menu"
          className="invisible absolute left-full top-0 z-50 min-w-56 -translate-x-1 bg-nav-background py-2 opacity-0 shadow-lg transition group-hover/sub:visible group-hover/sub:translate-x-0 group-hover/sub:opacity-100"
        >
          {node.children.map((c) => (
            <DesktopNavItem key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
