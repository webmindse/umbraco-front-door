import { useNavigate } from "@tanstack/react-router";

import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import { otherCulture, type Culture } from "@/lib/culture";

export interface LanguagePickerProps {
  /** Current culture (drives label/flag from the loaded site doc). */
  culture: Culture;
  /** Flag image of the OTHER culture (what we'd switch to). */
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
      className="inline-flex items-center gap-2 rounded px-2 py-1"
      aria-label={otherFlagAlt ?? `Switch to ${otherLanguageName ?? target}`}
      title={otherLanguageName ?? target.toUpperCase()}
    >
      {otherFlag ? (
        <UmbracoImage
          media={otherFlag}
          alt={otherFlagAlt}
          height={20}
          className="h-5 w-auto"
        />
      ) : (
        <span className="text-xs font-semibold">{target.toUpperCase()}</span>
      )}
    </button>
  );
}
