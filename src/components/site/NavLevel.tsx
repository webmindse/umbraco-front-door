import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ContentItem } from "@/integrations/umbraco/types";

export interface NavNode {
  id: string;
  name: string;
  path: string;
  hideInNavigation: boolean;
  children: NavNode[];
}

function parentOf(path: string): string {
  const trimmed = path.replace(/\/$/, "");
  const idx = trimmed.lastIndexOf("/");
  return trimmed.substring(0, idx + 1) || "/";
}

/**
 * Build a navigation tree from a flat list of descendants. Pages with
 * `hideInNavigation === true` are filtered out (and their subtrees as well).
 */
export function buildNavTree(
  items: ContentItem[],
  rootPath: string,
): NavNode[] {
  const sorted = [...items].sort(
    (a, b) => (a.route?.path?.length ?? 0) - (b.route?.path?.length ?? 0),
  );
  const byPath = new Map<string, NavNode>();
  const roots: NavNode[] = [];
  for (const it of sorted) {
    const path = it.route?.path ?? "";
    if (!path) continue;
    const props = it.properties ?? {};
    const hideInNavigation = props.hideInNavigation === true;
    const node: NavNode = {
      id: it.id,
      name: it.name,
      path,
      hideInNavigation,
      children: [],
    };
    byPath.set(path, node);
    if (hideInNavigation) continue;
    const parent = parentOf(path);
    const parentNode = byPath.get(parent);
    if (parentNode) parentNode.children.push(node);
    else if (parent === rootPath || parent === rootPath.replace(/\/$/, "/"))
      roots.push(node);
    else roots.push(node); // fallback for unexpected hierarchies
  }
  return roots;
}

interface NavLevelProps {
  title: string | null;
  items: NavNode[];
  onDrill: (node: NavNode) => void;
  onBack?: () => void;
  onSelect?: () => void;
  backLabel?: string;
}

/**
 * A single drill-down level used inside the mobile sheet. Shows an optional
 * "back" row, then a list of items. Items with children also render a ">"
 * affordance that drills one level deeper.
 */
export function NavLevel({
  title,
  items,
  onDrill,
  onBack,
  onSelect,
  backLabel = "Tillbaka",
}: NavLevelProps) {
  return (
    <div className="flex flex-col">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex w-full items-center gap-2 border-b border-border px-4 py-4 text-left text-base font-medium"
        >
          <span aria-hidden="true">&lt;</span>
          <span>{title ?? backLabel}</span>
        </button>
      ) : null}
      <ul className="flex flex-col">
        {items.map((node) => (
          <li
            key={node.id}
            className="flex items-stretch border-b border-border"
          >
            <Link
              to={node.path}
              onClick={onSelect}
              className="flex-1 px-4 py-4 text-base"
            >
              {node.name}
            </Link>
            {node.children.length > 0 ? (
              <button
                type="button"
                aria-label={`Open ${node.name} submenu`}
                onClick={() => onDrill(node)}
                className="px-4 text-xl"
              >
                &gt;
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
