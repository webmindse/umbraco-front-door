// Hand-rolled minimal types for the Umbraco Delivery API v2.
//
// The remote swagger endpoint (`/umbraco/delivery/api/v2/swagger.json`) is
// not exposed on this Umbraco Cloud instance, so we model the shapes we
// actually consume. If swagger is later enabled, replace this file with the
// output of `scripts/generate-types.sh` (skill-bundled).
//
// All `properties` bags are typed as JSON-serializable maps so values flow
// across the TanStack Start server-fn RPC boundary.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface UmbracoRoute {
  path: string;
  queryString: string | null;
  startItem: { id: string; path: string };
}

export interface UmbracoMedia {
  focalPoint: { left: number; top: number } | null;
  crops: Array<{ alias: string; width: number; height: number; coordinates: JsonValue }>;
  id: string;
  name: string;
  mediaType: string;
  url: string;
  extension: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  properties: JsonObject;
}

export interface UmbracoRichText {
  markup: string;
  blocks: BlockItem[];
}

/** A single block inside a Block List or Block Grid. */
export interface BlockItem<
  TContentType extends string = string,
  TProps extends JsonObject = JsonObject,
  TSettingsProps extends JsonObject = JsonObject,
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
  TProps extends JsonObject = JsonObject,
> {
  contentType: TContentType;
  name: string;
  createDate: string;
  updateDate: string;
  route: UmbracoRoute;
  id: string;
  properties: TProps;
  cultures: JsonObject;
}

export interface ContentResponse<T extends ContentItem = ContentItem> {
  total: number;
  items: T[];
}
