import { Mail, Phone } from "lucide-react";

import { RichTextRenderer } from "@/components/umbraco/RichTextRenderer";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";
import type { BlockItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface ContactCardContent {
  fullName?: string | null;
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  image?: UmbracoMediaLike[] | null;
  eMail?: string | null;
  phone?: string | null;
}

interface ContactsContent {
  text?: { markup?: string; blocks?: unknown[] } | string | null;
  contactCards?: { items?: BlockItem[] } | null;
}

type BgColor = "None" | "Primary" | "Secondary" | string | null;

interface ContactsSettings {
  backgroundColor?: BgColor;
  anchorId?: string | null;
  applyMarginAbove?: boolean | null;
  applyMarginBelow?: boolean | null;
  fullWidth?: boolean | null;
}

function bgClasses(color: BgColor) {
  switch (color) {
    case "Primary":
      return "bg-background-primary text-background-primary-contrast";
    case "Secondary":
      return "bg-background-secondary text-background-secondary-contrast";
    default:
      return "";
  }
}

export default function Contacts({ content, settings }: BlockComponentProps) {
  const c = content as unknown as ContactsContent;
  const s = (settings ?? {}) as unknown as ContactsSettings;

  const cards = c.contactCards?.items ?? [];
  const hasText = Boolean(c.text);
  const wrap = bgClasses(s.backgroundColor ?? "None");
  const fullBg = !!s.fullWidth && !!wrap;

  return (
    <section
      id={s.anchorId ?? undefined}
      className={cn(
        s.applyMarginAbove !== false && "mt-12 md:mt-16",
        s.applyMarginBelow !== false && "mb-12 md:mb-16",
        fullBg && wrap,
        fullBg && "py-12 md:py-16",
      )}
    >
      <div className={cn("mx-auto max-w-6xl px-6", !fullBg && wrap, !fullBg && "py-12 md:py-16 rounded-lg")}>
        {hasText ? (
          <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
            <RichTextRenderer
              value={c.text}
              className="prose-headings:mt-0 [&_p]:opacity-80"
            />
          </div>
        ) : null}

        {cards.length ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((item) => {
              const props = (item.content.properties ?? {}) as unknown as ContactCardContent;
              const media = props.image?.[0];
              return (
                <div
                  key={item.content.id}
                  className="flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground shadow-md ring-1 ring-black/5"
                >
                  {media ? (
                    <div className="aspect-square w-full overflow-hidden">
                      <UmbracoImage
                        media={media}
                        width={480}
                        height={480}
                        alt={props.fullName ?? media.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-1 flex-col p-6">
                    {props.fullName ? (
                      <h3 className="text-lg font-semibold tracking-tight">{props.fullName}</h3>
                    ) : null}

                    {props.text ? (
                      <RichTextRenderer
                        value={props.text}
                        className="mt-2 text-sm text-muted-foreground [&_p]:text-muted-foreground"
                      />
                    ) : null}

                    {(props.eMail || props.phone) ? (
                      <div className="mt-auto flex flex-col gap-2 pt-5 text-sm">
                        {props.eMail ? (
                          <a
                            href={`mailto:${props.eMail}`}
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                          >
                            <Mail className="h-4 w-4 shrink-0" aria-hidden />
                            <span className="break-all">{props.eMail}</span>
                          </a>
                        ) : null}
                        {props.phone ? (
                          <a
                            href={`tel:${props.phone.replace(/\s+/g, "")}`}
                            className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
                          >
                            <Phone className="h-4 w-4 shrink-0" aria-hidden />
                            <span>{props.phone}</span>
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
