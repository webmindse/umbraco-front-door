/**
 * Resolve a shadcn Button variant from a CMS button colour, taking the
 * panel the button sits on into account so a button never renders in the
 * same colour as its background.
 *
 * Rules:
 * - "Transparent" always maps to the outline variant.
 * - A "Primary" button on a primary panel (or "Secondary" on a secondary
 *   panel) would be invisible, so it falls back to outline, which uses the
 *   panel's contrast colour for border and text.
 * - Everything else keeps its explicit CMS choice.
 */
export type ButtonColor = "Primary" | "Secondary" | "Transparent" | string | null | undefined;

export type PanelColor = "primary" | "secondary" | null;

export function buttonVariantFor(
  color: ButtonColor,
  panel: PanelColor = null,
): "default" | "secondary" | "outline" {
  switch (color) {
    case "Transparent":
      return "outline";
    case "Secondary":
      return panel === "secondary" ? "outline" : "secondary";
    case "Primary":
    default:
      return panel === "primary" ? "outline" : "default";
  }
}
