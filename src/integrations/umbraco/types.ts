// Hand-rolled minimal types for the Umbraco Delivery API v2.
//
// The remote swagger endpoint (`/umbraco/delivery/api/v2/swagger.json`) is
// not exposed on this Umbraco Cloud instance, so we model the shapes we
// actually consume. If swagger is later enabled, replace this file with the
// output of `scripts/generate-types.sh` (skill-bundled).

export interface UmbracoRoute {
  path: string;
  queryString: string | null;
  startItem: { id: string; path: string };
}

export interface UmbracoMedia {
  focalPoint: { left: number; top: number } | null;
  crops: Array<{ alias: string; width: number; height: number; coordinates?: unknown }>;
  id: string;
  name: string;
  mediaType: string;
  url: string;
  extension: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  properties: Record<string, unknown>;
}

export interface UmbracoRichText {
  markup: string;
  blocks: BlockItem[];
}

/** A single block inside a Block List or Block Grid. */
export interface BlockItem<
  TContentType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
  TSettingsProps extends Record<string, unknown> = Record<string, unknown>,
> {
  content: {
    contentType: TContentType;
    id: string;
    properties: TProps;
  };
  settings: {
    contentType: string;
    id: string;
    properties: TSettingsProps;
  } | null;
}

export interface BlockList<T extends BlockItem = BlockItem> {
  items: T[];
}

/** Generic content item returned by the Delivery API. */
export interface ContentItem<
  TContentType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  contentType: TContentType;
  name: string;
  createDate: string;
  updateDate: string;
  route: UmbracoRoute;
  id: string;
  properties: TProps;
  cultures: Record<string, unknown>;
}

export interface ContentResponse<T extends ContentItem = ContentItem> {
  total: number;
  items: T[];
}
