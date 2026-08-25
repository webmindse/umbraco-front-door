import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Globe } from "lucide-react";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { otherCulture, type Culture } from "@/lib/culture";

export interface LanguagePickerProps {
  /** Current culture. */
  culture: Culture;
  /** Flag of the CURRENT culture (shown by default). */
  currentFlag?: UmbracoMediaLike | null;
  /** Alt text for the current flag. */
  currentFlagAlt?: string;
  /** Display name of the current culture. */
  currentLanguageName?: string;
  /** Flag image of the OTHER culture (slides in on hover). */
  otherFlag?: UmbracoMediaLike | null;
  /** Alt text for the OTHER flag. */
  otherFlagAlt?: string;
  /** Display name of the OTHER culture (e.g. "English"). */
  otherLanguageName?: string;
  /** Map from culture → URL path on the current page in that culture. */
  cultureRoutes?: Partial<Record<Culture, string>>;
  /** Fallback paths if the current page doesn't have a translation. */
  fallbackRoutes: Record<Culture, string>;
  /** Layout variant. `row` is used inside the mobile sheet. */
  variant?: "compact" | "row";
}

export function LanguagePicker({
  culture,
  currentFlag,
  currentFlagAlt,
  currentLanguageName,
  otherFlag,
  otherFlagAlt,
  otherLanguageName,
  cultureRoutes,
  fallbackRoutes,
  variant = "compact",
}: LanguagePickerProps) {
  const navigate = useNavigate();
  const target = otherCulture(culture);
  const href = cultureRoutes?.[target] ?? fallbackRoutes[target];

  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const closeSoon = () => {
    cancel();
    timer.current = setTimeout(() => setOpen(false), 180);
  };

  const goOther = () => {
    if (!href) return;
    setOpen(false);
    navigate({ to: href });
  };

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={goOther}
        className="flex w-full items-center gap-3 rounded px-2 py-3 text-left"
        aria-label={otherFlagAlt ?? `Switch to ${otherLanguageName ?? target}`}
      >
        {otherFlag ? (
          <UmbracoImage
            media={otherFlag}
            alt={otherFlagAlt}
            height={20}
            className="h-5 w-auto"
          />
        ) : null}
        <span className="text-sm font-medium">
          {otherLanguageName ?? target.toUpperCase()}
        </span>
      </button>
    );
  }

  const rows = [
    {
      key: culture,
      current: true,
      flag: currentFlag,
      alt: currentFlagAlt,
      name: currentLanguageName ?? culture.toUpperCase(),
      onClick: () => setOpen(false),
    },
    {
      key: target,
      current: false,
      flag: otherFlag,
      alt: otherFlagAlt,
      name: otherLanguageName ?? target.toUpperCase(),
      onClick: goOther,
    },
  ];

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancel();
        setOpen(true);
      }}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select language"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-nav-foreground/60 transition-colors hover:text-nav-foreground"
      >
        <Globe className="h-5 w-5" aria-hidden="true" />
      </button>

      <div
        role="menu"
        data-open={open ? "true" : "false"}
        className="invisible absolute right-0 top-full z-50 translate-y-1 pt-3 opacity-0 transition duration-200 data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
      >
        <ul className="min-w-[11rem] rounded-md bg-nav-secondary-background p-2 shadow-xl ring-1 ring-black/5">
          {rows.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                onClick={r.onClick}
                data-current={r.current ? "true" : "false"}
                className="flex w-full items-center gap-3 rounded px-2 py-2 text-left text-sm text-nav-secondary-foreground/70 transition-colors hover:text-nav-secondary-foreground data-[current=true]:font-semibold data-[current=true]:text-nav-secondary-foreground"
              >
                {r.flag ? (
                  <UmbracoImage
                    media={r.flag}
                    alt={r.alt}
                    height={16}
                    className="h-4 w-auto shrink-0"
                  />
                ) : null}
                <span>{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
