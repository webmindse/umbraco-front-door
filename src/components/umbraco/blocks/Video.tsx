import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { resolveUmbracoMediaUrl, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface VideoContent {
  videoFile?: UmbracoMediaLike[] | null;
  youTube?: string | null;
  vimeo?: string | null;
  description?: { markup?: string } | string | null;
}

interface VideoSettings {
  backgroundColor?: "Primary" | "Secondary" | null;
  anchorId?: string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  /** e.g. "50%", "66%", "100%" */
  width?: string | null;
  showControls?: boolean | null;
  autoPlay?: boolean | null;
  mute?: boolean | null;
  loop?: boolean | null;
}

const BG_CLASSES: Record<string, string> = {
  Primary: "bg-brand-mauve-shadow text-text-light",
  Secondary: "bg-brand-onyx text-text-light",
};

/** Extract a YouTube video id from a URL or accept a raw id. */
function parseYouTubeId(input: string): string | null {
  const v = input.trim();
  if (!v) return null;
  // Bare id (11 chars, url-safe)
  if (/^[\w-]{11}$/.test(v)) return v;
  try {
    const u = new URL(v);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1).split("/")[0] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return id;
      // /embed/<id> or /shorts/<id>
      const m = u.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // not a URL
  }
  return null;
}

/** Extract `{ id, hash }` from a Vimeo URL or "id" / "id/hash" string. */
function parseVimeo(input: string): { id: string; hash?: string } | null {
  const v = input.trim();
  if (!v) return null;
  // id or id/hash
  const direct = v.match(/^(\d+)(?:\/([\w-]+))?$/);
  if (direct) return { id: direct[1], hash: direct[2] };
  try {
    const u = new URL(v);
    // vimeo.com/<id>(/<hash>)?
    const m = u.pathname.match(/^\/(\d+)(?:\/([\w-]+))?/);
    if (m) return { id: m[1], hash: m[2] };
  } catch {
    // not a URL
  }
  return null;
}

function buildEmbedSrc(opts: {
  kind: "youtube" | "vimeo";
  id: string;
  hash?: string;
  autoPlay: boolean;
  mute: boolean;
  loop: boolean;
  controls: boolean;
}): string {
  const { kind, id, hash, autoPlay, mute, loop, controls } = opts;
  const params = new URLSearchParams();
  if (kind === "youtube") {
    if (autoPlay) params.set("autoplay", "1");
    if (mute || autoPlay) params.set("mute", "1");
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", id);
    }
    if (!controls) params.set("controls", "0");
    params.set("rel", "0");
    params.set("playsinline", "1");
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }
  // Vimeo
  if (autoPlay) params.set("autoplay", "1");
  if (mute || autoPlay) params.set("muted", "1");
  if (loop) params.set("loop", "1");
  if (!controls) params.set("controls", "0");
  params.set("playsinline", "1");
  if (hash) params.set("h", hash);
  const path = hash ? `${id}?${params.toString()}` : `${id}?${params.toString()}`;
  return `https://player.vimeo.com/video/${path}`;
}

export default function Video({ content, settings }: BlockComponentProps) {
  const { videoFile, youTube, vimeo, description } =
    content as unknown as VideoContent;
  const s = (settings ?? {}) as unknown as VideoSettings;

  const autoPlay = s.autoPlay === true;
  const mute = s.mute === true;
  const loop = s.loop === true;
  const controls = s.showControls === true;

  const file = videoFile?.[0];
  const yt = youTube ? parseYouTubeId(youTube) : null;
  const vm = vimeo ? parseVimeo(vimeo) : null;

  let media: React.ReactNode = null;
  if (file?.url) {
    media = (
      <video
        src={resolveUmbracoMediaUrl(file.url)}
        controls={controls}
        autoPlay={autoPlay}
        muted={mute || autoPlay}
        loop={loop}
        playsInline
        className="block h-auto w-full"
      />
    );
  } else if (yt) {
    media = (
      <div className="relative aspect-video w-full">
        <iframe
          src={buildEmbedSrc({
            kind: "youtube",
            id: yt,
            autoPlay,
            mute,
            loop,
            controls,
          })}
          title="YouTube video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  } else if (vm) {
    media = (
      <div className="relative aspect-video w-full">
        <iframe
          src={buildEmbedSrc({
            kind: "vimeo",
            id: vm.id,
            hash: vm.hash,
            autoPlay,
            mute,
            loop,
            controls,
          })}
          title="Vimeo video"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (!media) return null;

  const bgClass = s.backgroundColor ? BG_CLASSES[s.backgroundColor] : "";
  const onDark = Boolean(bgClass);

  const inner = (
    <div className="mx-auto" style={{ maxWidth: s.width ?? "66%" }}>
      {description ? (
        <RichTextRenderer
          value={description}
          className={cn(
            "mb-6 max-w-none prose-sm md:prose-base",
            "prose-h1:text-3xl md:prose-h1:text-4xl",
            "prose-h2:text-2xl md:prose-h2:text-3xl",
            "prose-h3:text-xl md:prose-h3:text-2xl",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80",
            onDark &&
              "prose-invert prose-headings:text-text-light prose-p:text-text-light/90 prose-strong:text-text-light",
          )}
        />
      ) : null}
      <div className="overflow-hidden">{media}</div>
    </div>
  );

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        s.applyMarginAbove && "mt-12 md:mt-16",
        s.applyMarginBelow && "mb-12 md:mb-16",
      )}
    >
      {bgClass ? (
        <div className={cn(bgClass, "px-8 py-12 md:px-16 md:py-16")}>
          {inner}
        </div>
      ) : (
        <div className="px-6">{inner}</div>
      )}
    </section>
  );
}
