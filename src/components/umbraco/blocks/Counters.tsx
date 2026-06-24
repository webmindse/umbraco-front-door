import { useEffect, useRef, useState } from "react";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import type { BlockItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface CounterProps {
  number?: string | number | null;
  numberPrefix?: string | null;
  numberSuffix?: string | null;
  image?: UmbracoMediaLike[] | null;
  heading?: string | null;
  text?: string | null;
}

interface CountersContent {
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  counterList?: { items?: BlockItem[] };
}

interface CountersSettings {
  anchorId?: string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  circleImages?: boolean | null;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("sv-SE").replace(/\u00a0/g, " ");
}

function useCountUp(target: number, durationMs = 1800, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const begin = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - begin) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, start]);

  return value;
}

function CounterItem({ data, circle }: { data: CounterProps; circle: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const target = Number(data.number ?? 0) || 0;
  const value = useCountUp(target, 1800, visible);
  const media = data.image?.[0];

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="flex flex-1 flex-col items-center text-center">
      {media ? (
        <div
          className={cn(
            "relative w-full overflow-hidden",
            circle ? "aspect-square rounded-full" : "aspect-[4/3] rounded-lg",
          )}
        >
          <UmbracoImage media={media} fill alt={data.heading ?? media.name ?? ""} width={600} height={600} />
        </div>
      ) : null}

      <div className="mt-8 flex items-baseline justify-center gap-2">
        {data.numberPrefix ? (
          <span className="text-2xl font-semibold text-foreground/80 md:text-3xl">
            {data.numberPrefix}
          </span>
        ) : null}
        <span className="text-5xl font-bold tracking-tight md:text-6xl">
          {formatNumber(value)}
        </span>
        {data.numberSuffix ? (
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground md:text-base">
            {data.numberSuffix}
          </span>
        ) : null}
      </div>

      {data.heading ? (
        <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
          {data.heading}
        </h3>
      ) : null}
      {data.text ? (
        <p className="mt-1 text-base text-muted-foreground">{data.text}</p>
      ) : null}
    </div>
  );
}

export default function Counters({ content, settings }: BlockComponentProps) {
  const { text, counterList } = content as unknown as CountersContent;
  const s = (settings ?? {}) as unknown as CountersSettings;
  const items = counterList?.items ?? [];
  const circle = s.circleImages !== false;

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        "mx-auto w-full px-6",
        s.applyMarginAbove && "mt-12 md:mt-16",
        s.applyMarginBelow && "mb-12 md:mb-16",
      )}
    >
      <div className="mx-auto max-w-6xl">
        {text ? (
          <div className="mx-auto mb-12 max-w-3xl">
            <RichTextRenderer
              value={text}
              className={cn(
                "prose-sm md:prose-base leading-relaxed",
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-h1:text-3xl md:prose-h1:text-4xl",
                "prose-h2:text-2xl md:prose-h2:text-3xl",
                "prose-h3:text-xl md:prose-h3:text-2xl",
                "prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80",
              )}
            />
          </div>
        ) : null}

        {items.length ? (
          <div className="flex flex-col gap-12 md:flex-row md:gap-8">
            {items.map((item) => (
              <CounterItem
                key={item.content.id}
                data={item.content.properties as unknown as CounterProps}
                circle={circle}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
