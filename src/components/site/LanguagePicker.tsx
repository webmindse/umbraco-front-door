import { useNavigate } from "@tanstack/react-router";

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

  const onClick = () => {
    if (!href) return;
    navigate({ to: href });
  };

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={onClick}
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

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex h-6 w-9 items-center justify-center overflow-hidden rounded-sm"
      aria-label={otherFlagAlt ?? `Switch to ${otherLanguageName ?? target}`}
      title={otherLanguageName ?? target.toUpperCase()}
    >
      {currentFlag ? (
        <UmbracoImage
          media={currentFlag}
          alt={currentFlagAlt}
          height={24}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:-translate-x-full"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold transition-transform duration-300 ease-out group-hover:-translate-x-full">
          {culture.toUpperCase()}
        </span>
      )}
      {otherFlag ? (
        <UmbracoImage
          media={otherFlag}
          alt={otherFlagAlt}
          height={24}
          className="absolute inset-0 h-full w-full translate-x-full object-cover transition-transform duration-300 ease-out group-hover:translate-x-0"
        />
      ) : (
        <span className="absolute inset-0 flex translate-x-full items-center justify-center text-xs font-semibold transition-transform duration-300 ease-out group-hover:translate-x-0">
          {target.toUpperCase()}
        </span>
      )}
    </button>
  );
}
