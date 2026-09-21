import { BlockListRenderer } from "@/components/umbraco/BlockListRenderer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { BlockItem } from "@/integrations/umbraco/types";
import { cn } from "@/lib/utils";

import type { BlockComponentProps } from "./registry";

interface SectionNavigationItemContent {
  sectionName?: string | null;
  widgets?: { items?: BlockItem[] } | null;
  hideForSome?: boolean | null;
  memberGroups?: unknown[] | null;
}

interface SectionNavigationContent {
  navigationItems?: { items?: BlockItem[] } | null;
}

type BackgroundColor = "Primary" | "Secondary" | string | null;

interface SectionNavigationSettings {
  boxed?: boolean | null;
  border?: boolean | null;
  backgroundColor?: BackgroundColor;
  fullWidth?: boolean | null;
}

function panelClasses(color: BackgroundColor) {
  switch (color) {
    case "Secondary":
      return "bg-background-secondary text-background-secondary-contrast";
    case "Primary":
      return "bg-background-primary text-background-primary-contrast";
    case "None":
    default:
      return "bg-transparent text-foreground";
  }
}

function activeTabClasses(color: BackgroundColor) {
  switch (color) {
    case "Secondary":
      return "data-[state=active]:bg-background-secondary data-[state=active]:text-background-secondary-contrast";
    case "Primary":
      return "data-[state=active]:bg-background-primary data-[state=active]:text-background-primary-contrast";
    case "None":
    default:
      return "data-[state=active]:bg-background data-[state=active]:text-foreground";
  }
}

export default function SectionNavigation({
  content,
  settings,
}: BlockComponentProps) {
  const { navigationItems } = content as unknown as SectionNavigationContent;
  const s = (settings ?? {}) as unknown as SectionNavigationSettings;

  const items = (navigationItems?.items ?? []).filter((item) => {
    const itemContent = item.content.properties as unknown as SectionNavigationItemContent;
    return !(itemContent.hideForSome && itemContent.memberGroups?.length);
  });

  if (!items.length) return null;

  const backgroundColor = s.backgroundColor ?? "None";
  const panel = panelClasses(backgroundColor);
  const activeTab = activeTabClasses(backgroundColor);
  const firstItemId = items[0]?.content.id;
  if (!firstItemId) return null;

  return (
    <section
      className={cn(
        "mx-auto my-12 w-full px-6 md:my-16",
        !s.fullWidth && "max-w-screen-2xl",
      )}
    >
      <Tabs defaultValue={firstItemId} className="w-full">
        <div className={cn("w-full", s.boxed && "mx-auto max-w-5xl")}>
          <div className="overflow-x-auto">
            <TabsList
              aria-label="Sections"
              className={cn(
                "flex h-auto w-full min-w-max items-stretch justify-center gap-1 rounded-none bg-transparent p-0",
              )}
            >
              {items.map((item) => {
                const itemContent = item.content.properties as unknown as SectionNavigationItemContent;
                return (
                  <TabsTrigger
                    key={item.content.id}
                    value={item.content.id}
                    className={cn(
                      "min-h-20 min-w-36 flex-1 rounded-none border border-transparent bg-muted px-8 py-5 text-base text-muted-foreground shadow-none",
                      "hover:bg-muted/80 hover:text-foreground",
                      "data-[state=active]:border-transparent data-[state=active]:shadow-none",
                      activeTab,
                    )}
                  >
                    {itemContent.sectionName ?? ""}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {items.map((item) => {
            const itemContent = item.content.properties as unknown as SectionNavigationItemContent;
            return (
              <TabsContent
                key={item.content.id}
                value={item.content.id}
                className={cn(
                  "mt-0 min-h-64 px-2 py-10 md:px-8 md:py-14",
                  panel,
                  s.border && "border border-border",
                )}
              >
                <BlockListRenderer items={itemContent.widgets?.items} />
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </section>
  );
}