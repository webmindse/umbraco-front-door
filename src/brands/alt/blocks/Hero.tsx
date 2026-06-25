import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import type { JsonObject } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "@/components/umbraco/blocks/registry";

type ButtonColor = "Primary" | "Secondary" | "Transparent" | string;

interface HeroContent {
  media?: UmbracoMediaLike[];
  preHeading?: string;
  heading?: string;
  animatedWords?: string[];
  text?: { markup?: string; blocks?: unknown[] } | string;
  buttonOne?: UmbracoLinkPickerItem[];
  buttonOneColor?: ButtonColor;
  buttonTwo?: UmbracoLinkPickerItem[];
  buttonTwoColor?: ButtonColor;
  buttonThree?: UmbracoLinkPickerItem[];
  buttonThreeColor?: ButtonColor;
  scrollIcon?: boolean;
}

interface HeroSettings {
  height?: number;
  backgroundColor?: boolean;
}

const ANIMATED_TOKEN = "#animatedWords";

function useAnimatedWord(words: string[] | undefined): string | null {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!words || words.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      2500,
    );
    return () => window.clearInterval(id);
  }, [words]);
  if (!words || words.length === 0) return null;
  return words[index % words.length];
}

/**
 * Alt brand Hero. Asymmetric, editorial-modern look:
 * - Left-aligned heading on a tinted indigo overlay
 * - Coral accent rule above the pre-heading
 * - Squared CTAs with peach/coral palette
 */
export default function Hero({ content, settings }: BlockComponentProps) {
  const {
    media,
    preHeading,
    heading,
    animatedWords,
    text,
    buttonOne,
    buttonOneColor,
    buttonTwo,
    buttonThree,
    scrollIcon,
  } = content as unknown as HeroContent;

  const { height } = (settings ?? {}) as unknown as HeroSettings;
  const minHeight = `${height ?? 85}vh`;

  const image = media?.[0];
  const currentWord = useAnimatedWord(animatedWords);
  const headingParts = (heading ?? "").split(ANIMATED_TOKEN);
  const hasToken = headingParts.length > 1 && currentWord;

  const handleScroll = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[color:var(--brand-alt-deep-indigo)] text-[color:var(--brand-alt-peach)]"
      style={{ minHeight }}
    >
      {image ? (
        <>
          <UmbracoImage
            media={image}
            width={1920}
            fill
            loading="eager"
            alt={image.name}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, color-mix(in oklab, var(--brand-alt-deep-indigo) 88%, transparent) 0%, color-mix(in oklab, var(--brand-alt-mauve) 55%, transparent) 55%, color-mix(in oklab, var(--brand-alt-deep-indigo) 30%, transparent) 100%)",
            }}
            aria-hidden
          />
        </>
      ) : null}

      <div
        className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-6 py-24 md:px-12"
        style={{ minHeight }}
      >
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-[color:var(--brand-alt-coral)]" aria-hidden />
            {preHeading ? (
              <p className="font-display text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--brand-alt-coral)]">
                {preHeading}
              </p>
            ) : null}
          </div>

          {heading ? (
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-[color:var(--brand-alt-peach)] md:text-7xl">
              {hasToken ? (
                <>
                  {headingParts[0]}
                  <span
                    key={currentWord}
                    className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-500 text-[color:var(--brand-alt-coral)]"
                  >
                    {currentWord}
                  </span>
                  {headingParts[1]}
                </>
              ) : (
                heading
              )}
            </h1>
          ) : null}

          {text ? (
            <RichTextRenderer
              value={text}
              className="mt-8 max-w-xl text-lg leading-relaxed text-[color:var(--brand-alt-peach)]/85 [&_p]:text-[color:var(--brand-alt-peach)]/85"
            />
          ) : null}

          {(buttonOne?.[0] || buttonTwo?.[0] || buttonThree?.[0]) && (
            <div className="mt-10 flex flex-wrap gap-4">
              {buttonOne?.[0] && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-none bg-[color:var(--brand-alt-coral)] px-8 font-display text-sm uppercase tracking-[0.16em] text-[color:var(--brand-alt-deep-indigo)] hover:bg-[color:var(--brand-alt-peach)]"
                >
                  <span>
                    <UmbracoLink link={buttonOne[0] as unknown as JsonObject}>
                      {buttonOne[0].title}
                    </UmbracoLink>
                  </span>
                </Button>
              )}
              {buttonTwo?.[0] && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className={cn(
                    "rounded-none border-[color:var(--brand-alt-peach)]/60 bg-transparent px-8 font-display text-sm uppercase tracking-[0.16em] text-[color:var(--brand-alt-peach)]",
                    "hover:bg-[color:var(--brand-alt-peach)]/10 hover:text-[color:var(--brand-alt-peach)]",
                  )}
                >
                  <span>
                    <UmbracoLink link={buttonTwo[0] as unknown as JsonObject}>
                      {buttonTwo[0].title}
                    </UmbracoLink>
                  </span>
                </Button>
              )}
              {buttonThree?.[0] && (
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-none px-8 font-display text-sm uppercase tracking-[0.16em] text-[color:var(--brand-alt-coral)] hover:bg-transparent hover:text-[color:var(--brand-alt-peach)]"
                >
                  <span>
                    <UmbracoLink link={buttonThree[0] as unknown as JsonObject}>
                      {buttonThree[0].title}
                    </UmbracoLink>
                  </span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {scrollIcon ? (
        <button
          type="button"
          onClick={handleScroll}
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full border border-[color:var(--brand-alt-coral)]/40 p-3 text-[color:var(--brand-alt-coral)] transition hover:border-[color:var(--brand-alt-coral)] hover:bg-[color:var(--brand-alt-coral)]/10"
        >
          <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden />
        </button>
      ) : null}
    </section>
  );
}
