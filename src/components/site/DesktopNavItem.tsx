import { useRef, useState } from "react";
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

/** Third level rendered as a plain list inside a dropdown column. */
function MegaLeaf({ node, onSelect }: { node: NavNode; onSelect: () => void }) {
  const isActive = useIsActive(node.path);
  return (
    <li>
      <Link
        to={node.path}
        onClick={onSelect}
        data-active={isActive ? "true" : "false"}
        className="block py-1 text-sm text-nav-secondary-foreground/70 transition-colors hover:text-nav-secondary-foreground data-[active=true]:text-nav-secondary-foreground"
      >
        {node.name}
      </Link>
    </li>
  );
}

/** Second level: a column heading inside the dropdown. */
function MegaColumn({ node, onSelect }: { node: NavNode; onSelect: () => void }) {
  const isActive = useIsActive(node.path);
  return (
    <li className="min-w-0">
      <Link
        to={node.path}
        onClick={onSelect}
        data-active={isActive ? "true" : "false"}
        className="block text-[0.95rem] font-semibold text-nav-secondary-foreground transition-opacity hover:opacity-80"
      >
        {node.name}
      </Link>
      {node.children.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5">
          {node.children.map((c) => (
            <MegaLeaf key={c.id} node={c} onSelect={onSelect} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DesktopNavItem({ node }: DesktopNavItemProps) {
  const isActive = useIsActive(node.path);
  const hasChildren = node.children.length > 0;
  const columns = node.children.length > 4 ? 2 : 1;

  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const openNow = () => {
    cancel();
    setOpen(true);
  };
  const closeSoon = () => {
    cancel();
    timer.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? openNow : undefined}
      onMouseLeave={hasChildren ? closeSoon : undefined}
      onFocus={hasChildren ? openNow : undefined}
      onBlur={hasChildren ? closeSoon : undefined}
    >
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
            data-open={open ? "true" : "false"}
            className="h-4 w-4 text-nav-foreground/70 transition-transform data-[open=true]:rotate-180"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {hasChildren ? (
        <div
          role="menu"
          data-open={open ? "true" : "false"}
          className="invisible absolute left-0 top-full z-50 translate-y-1 pt-3 opacity-0 transition duration-200 data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
        >
          <div className="rounded-md bg-nav-secondary-background p-6 shadow-xl ring-1 ring-black/5">
            <ul
              className="grid gap-x-10 gap-y-5"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(11rem, 1fr))`,
              }}
            >
              {node.children.map((c) => (
                <MegaColumn key={c.id} node={c} onSelect={() => setOpen(false)} />
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </li>
  );
}
