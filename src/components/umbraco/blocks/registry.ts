import type { ComponentType } from "react";

import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";

import Accordion from "./Accordion";
import Card from "./Card";
import Cards from "./Cards";
import Counters from "./Counters";
import Hero from "./Hero";
import ImageBlock from "./ImageBlock";
import Quote from "./Quote";
import Text from "./Text";
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
  accordion: Accordion as BlockComponent,
  quote: Quote as BlockComponent,
  text: Text as BlockComponent,
  imageBlock: ImageBlock as BlockComponent,
  counters: Counters as BlockComponent,
};

/**
 * Aliases that are intentionally handled elsewhere (e.g. footer navigation
 * items consumed directly by `SiteFooter`). They appear inside Block Lists
 * but should NOT trigger the "Missing block" warning.
 */
export const silentBlockAliases: ReadonlySet<string> = new Set([
  "footerNavigationItem",
]);
