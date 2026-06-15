import { useState } from "react";
import { Menu, X } from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UmbracoImage, type UmbracoMediaLike } from "@/components/umbraco/UmbracoImage";

import { NavLevel, type NavNode } from "./NavLevel";
import { LanguagePicker, type LanguagePickerProps } from "./LanguagePicker";

interface MobileNavSheetProps {
  nav: NavNode[];
  logo?: UmbracoMediaLike | null;
  logoAlt?: string;
  language: LanguagePickerProps;
}

export function MobileNavSheet({
  nav,
  logo,
  logoAlt,
  language,
}: MobileNavSheetProps) {
  // Stack of drilled-down nodes; empty = level 1.
  const [stack, setStack] = useState<NavNode[]>([]);
  const [open, setOpen] = useState(false);

  const current = stack[stack.length - 1];
  const items = current ? current.children : nav;

  const close = () => {
    setOpen(false);
    setTimeout(() => setStack([]), 250);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded text-text-light"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full max-w-full bg-background p-0 text-foreground sm:max-w-md [&>button.absolute]:hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          {logo ? (
            <UmbracoImage
              media={logo}
              alt={logoAlt}
              height={32}
              className="h-8 w-auto"
            />
          ) : (
            <SheetTitle>Menu</SheetTitle>
          )}
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetClose>
        </div>

        <NavLevel
          title={current?.name ?? null}
          items={items}
          onDrill={(node) => setStack((s) => [...s, node])}
          onBack={current ? () => setStack((s) => s.slice(0, -1)) : undefined}
          onSelect={close}
        />

        <div className="mt-auto border-t border-border px-4 py-4">
          <LanguagePicker {...language} variant="row" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
