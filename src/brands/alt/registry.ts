import type { BlockComponent } from "@/components/umbraco/blocks/registry";
import { silentBlockAliases as defaultSilent } from "@/components/umbraco/blocks/registry";

// Re-use default block components — they consume semantic CSS tokens
// (--primary, --background-secondary, --text-light, etc.) which are remapped
// under [data-brand="alt"] in src/styles.css, so they automatically take on
// the alt palette.
import Accordion from "@/components/umbraco/blocks/Accordion";
import Card from "@/components/umbraco/blocks/Card";
import Cards from "@/components/umbraco/blocks/Cards";
import Counters from "@/components/umbraco/blocks/Counters";
import DownloadList from "@/components/umbraco/blocks/DownloadList";
import ImageBlock from "@/components/umbraco/blocks/ImageBlock";
import Text from "@/components/umbraco/blocks/Text";
import TextAndMedia from "@/components/umbraco/blocks/TextAndMedia";
import Video from "@/components/umbraco/blocks/Video";

// Alt-specific layout variants
import Hero from "./blocks/Hero";
import Quote from "./blocks/Quote";

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
  video: Video as BlockComponent,
};

export const silentBlockAliases = defaultSilent;
