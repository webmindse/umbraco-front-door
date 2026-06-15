import type { ComponentType } from "react";

import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";

import Card from "./Card";
import Cards from "./Cards";
import Hero from "./Hero";
import TextAndMedia from "./TextAndMedia";

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
  hero: Hero as BlockComponent,
  cards: Cards as BlockComponent,
  card: Card as BlockComponent,
  textAndMedia: TextAndMedia as BlockComponent,
};
