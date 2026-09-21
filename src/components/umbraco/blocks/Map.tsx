import { Mail, MapPin, Phone } from "lucide-react";

import { BlockListRenderer } from "@/components/umbraco/BlockListRenderer";
import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import type { BlockItem, JsonObject } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface MapContent {
  contentBeside?: { items?: BlockItem[] } | null;
  preHeading?: string | null;
  heading?: string | null;
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

interface MapSettings {
  googleMapsKey?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  zoom?: number | null;
  width?: string | null;
  height?: string | null;
  contentPlacement?: "Left" | "Right" | string | null;
  customMapPinIcon?: unknown;
  backgroundColor?: "None" | "Primary" | "Secondary" | string | null;
  anchorId?: string | null;
}

function bgClasses(color: MapSettings["backgroundColor"]) {
  switch (color) {
    case "Primary":
      return "bg-background-primary text-background-primary-contrast";
    case "Secondary":
      return "bg-background-secondary text-background-secondary-contrast";
    default:
      return "bg-muted text-foreground";
  }
}

function num(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** A key the editor never filled in (e.g. a leftover `@secret:NAME` marker). */
function usableKey(key: string | null | undefined): string | null {
  const k = key?.trim();
  if (!k || k.startsWith("@secret:") || k.startsWith("$")) return null;
  return k;
}

function mapSrc(lat: number, lng: number, zoom: number, key: string | null): string {
  if (key) {
    const params = new URLSearchParams({
      key,
      q: `${lat},${lng}`,
      zoom: String(zoom),
    });
    return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
  }
  // Keyless fallback: OpenStreetMap with a marker.
  const span = 0.6 / Math.pow(2, zoom - 12);
  const bbox = [lng - span, lat - span / 2, lng + span, lat + span / 2].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export default function MapBlock({ content, settings }: BlockComponentProps) {
  const c = content as unknown as MapContent;
  const s = (settings ?? {}) as unknown as MapSettings;

  const lat = num(s.latitude);
  const lng = num(s.longitude);
  const zoom = num(s.zoom) ?? 14;
  const key = usableKey(s.googleMapsKey);
  const contentRight = (s.contentPlacement ?? "Right") !== "Left";

  const besideItems = c.contentBeside?.items ?? [];
  const hasBeside = besideItems.length > 0;

  const heightStyle =
    s.height && /^\d+(px|vh|rem)$/.test(s.height) ? { height: s.height } : undefined;

  const mapPane =
    lat !== null && lng !== null ? (
      <div
        className="min-h-[360px] w-full md:min-h-[560px] lg:min-h-[620px]"
        style={heightStyle}
      >
        <iframe
          title={c.heading ?? "Map"}
          src={mapSrc(lat, lng, zoom, key)}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    ) : null;

  const contactRows = [
    c.address
      ? {
          icon: MapPin,
          node: (
            <span className="whitespace-pre-line">{c.address}</span>
          ),
        }
      : null,
    c.phoneNumber
      ? {
          icon: Phone,
          node: (
            <a href={`tel:${c.phoneNumber.replace(/\s+/g, "")}`} className="hover:underline">
              {c.phoneNumber}
            </a>
          ),
        }
      : null,
    c.email
      ? {
          icon: Mail,
          node: (
            <a href={`mailto:${c.email}`} className="hover:underline">
              {c.email}
            </a>
          ),
        }
      : null,
  ].filter(Boolean) as Array<{ icon: typeof MapPin; node: React.ReactNode }>;

  const contentPane = (
    <div
      className={cn(
        "flex h-full flex-col justify-center px-6 py-12 md:px-12 lg:px-16 lg:py-20",
        bgClasses(s.backgroundColor),
      )}
    >
      {hasBeside ? (
        <BlockListRenderer items={besideItems} />
      ) : (
        <>
          {c.preHeading ? (
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.25em] opacity-80">
              {c.preHeading}
            </p>
          ) : null}
          {c.heading ? (
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{c.heading}</h2>
          ) : null}
          {c.text ? (
            <RichTextRenderer
              value={c.text as JsonObject}
              className="mt-5 prose-sm md:prose-base prose-p:opacity-90 prose-headings:text-current prose-p:text-current prose-strong:text-current prose-a:text-current"
            />
          ) : null}
          {contactRows.length ? (
            <ul className="mt-8 space-y-5 text-base">
              {contactRows.map(({ icon: Icon, node }, i) => (
                <li key={i} className="flex items-start gap-4">
                  <Icon className="mt-1 h-5 w-5 shrink-0 opacity-90" aria-hidden />
                  <div className="leading-relaxed">{node}</div>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <section
      id={s.anchorId ?? undefined}
      className="w-full"
      style={s.width && /^\d+(px|rem)$/.test(s.width) ? { maxWidth: s.width, marginInline: "auto" } : undefined}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {contentRight ? (
          <>
            {mapPane}
            {contentPane}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{contentPane}</div>
            <div className="order-1 lg:order-2">{mapPane}</div>
          </>
        )}
      </div>
    </section>
  );
}
