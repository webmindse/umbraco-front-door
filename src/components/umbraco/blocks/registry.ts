import type { ComponentType } from "react";

import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";

export interface BlockComponentProps<
  TContent extends JsonObject = JsonObject,
  TSettings extends JsonObject = JsonObject,
> {
  /** Editor-set property values for this block's element type. */
  content: TContent;
  /** Optional settings element type properties. */
  settings?: TSettings;
  /** Full block item (rarely needed; gives access to id and contentType). */
  block: BlockItem;
}

export type BlockComponent = ComponentType<BlockComponentProps>;

/**
 * Alias → component map. Keys are exact `contentType` strings from Umbraco
 * (case-sensitive). Add new blocks by creating the component then adding one
 * line here.
 */
export const blockRegistry: Record<string, BlockComponent> = {
  // Populated in subsequent batches. Until an alias is registered, the
  // BlockListRenderer falls back to <MissingBlock /> in dev.
};
