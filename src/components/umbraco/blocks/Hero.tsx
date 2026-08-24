import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { UmbracoLink, type UmbracoLinkPickerItem } from "@/components/umbraco/UmbracoLink";
import type { JsonObject } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

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
  /** Viewport-percent height (0–100). Defaults to 80. */
  height?: number;
  /** When true, render a tinted panel behind the text for contrast. */
  backgroundColor?: boolean;
}


const ANIMATED_TOKEN = "#animatedWords";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

function WordCarousel({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const count = words.length;

  if (count === 0) return null;
  if (count === 1 || reducedMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  const duration = count * 2.5;
  const items = [...words, words[0]];
  const styleId = `word-carousel-${count}`;

  const step = 100 / count;
  const hold = step * 0.75;

  const keyframes = Array.from({ length: count }, (_, i) => {
    const start = i * step;
    const end = (i + 1) * step;
    const translate = -((i / (count + 1)) * 100).toFixed(2);
    const nextTranslate = -(((i + 1) / (count + 1)) * 100).toFixed(2);
    return `${start.toFixed(2)}%, ${(start + hold).toFixed(2)}% { transform: translateY(${translate}%); }
${end.toFixed(2)}% { transform: translateY(${nextTranslate}%); }`;
  }).join("\n");

  return (
    <>
      <style>{`@keyframes ${styleId} { ${keyframes} }`}</style>
      <span
        className={cn(
          "relative inline-flex h-[1.1em] flex-col overflow-hidden align-baseline",
          className,
        )}
      >
        <span
          className="flex flex-col"
          style={{
            animation: `${styleId} ${duration}s cubic-bezier(0.76, 0, 0.24, 1) infinite`,
          }}
        >
          {items.map((word, i) => (
            <span
              key={i}
              className="flex h-[1.1em] items-center"
              aria-hidden={i === count ? true : undefined}
            >
              {word}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}

function useAnimatedWord(words: string[] | undefined): string | null {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!words || words.length <= 1) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [words]);
  if (!words || words.length === 0) return null;
  return words[index % words.length];
}

function variantFor(color: ButtonColor | undefined) {
  switch (color) {
    case "Secondary":
      return "secondary" as const;
    case "Transparent":
      return "outline" as const;
    case "Primary":
    default:
      return "default" as const;
  }
}

function HeroButton({
  link,
  color,
}: {
  link: UmbracoLinkPickerItem | undefined;
  color: ButtonColor | undefined;
}) {
  if (!link) return null;
  const variant = variantFor(color);
  return (
    <Button
      asChild
      size="lg"
      variant={variant}
      className={cn(
        variant === "outline" &&
          "bg-transparent text-text-light border-text-light hover:bg-text-light/10 hover:text-text-light",
      )}
    >
      <span>
        <UmbracoLink link={link as unknown as JsonObject}>{link.title}</UmbracoLink>
      </span>
    </Button>
  );
}

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
    buttonTwoColor,
    buttonThree,
    buttonThreeColor,
    scrollIcon,
  } = content as unknown as HeroContent;

  const { height, backgroundColor } = (settings ?? {}) as unknown as HeroSettings;
  const minHeight = `${height ?? 80}vh`;

  const image = media?.[0];
  const currentWord = useAnimatedWord(animatedWords);

  // Split heading on the literal #animatedWords token.
  const headingParts = (heading ?? "").split(ANIMATED_TOKEN);
  const hasToken = headingParts.length > 1 && currentWord;

  const handleScroll = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-background-secondary text-text-light"
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
          <div className="absolute inset-0 bg-black/50" aria-hidden />
        </>
      ) : null}

      <div
        className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center"
        style={{ minHeight }}
      >
        <div
          className={cn(
            "flex w-full flex-col items-center",
            backgroundColor &&
              "rounded-lg bg-background-secondary/80 p-8 backdrop-blur-sm md:p-12",
          )}
        >
          {preHeading ? (
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-text-light/80">
              {preHeading}
            </p>
          ) : null}

          {heading ? (
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-text-light md:text-6xl">
              {hasToken ? (
                <>
                  {headingParts[0]}
                  <span
                    key={currentWord}
                    className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-500 text-primary"
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
              className="mt-6 max-w-2xl text-lg text-text-light/90 [&_p]:text-text-light/90"
            />
          ) : null}

          {(buttonOne?.[0] || buttonTwo?.[0] || buttonThree?.[0]) && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <HeroButton link={buttonOne?.[0]} color={buttonOneColor} />
              <HeroButton link={buttonTwo?.[0]} color={buttonTwoColor} />
              <HeroButton link={buttonThree?.[0]} color={buttonThreeColor} />
            </div>
          )}
        </div>
      </div>


      {scrollIcon ? (
        <button
          type="button"
          onClick={handleScroll}
          aria-label="Scroll down"
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full p-2 text-text-light/80 transition hover:text-text-light"
        >
          <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden />
        </button>
      ) : null}
    </section>
  );
}
