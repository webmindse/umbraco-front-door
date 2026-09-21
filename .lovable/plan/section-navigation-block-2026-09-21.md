# Section Navigation block

## What will be built
- Add a `sectionNavigation` block matching the supplied reference: a horizontal tab row above one shared content panel.
- Use each `sectionName` as its tab label, select the first section initially, and show only the selected section’s nested `widgets`.
- Render nested Video, Cards, Text, and any future registered blocks through the existing block-list renderer, preserving their own CMS content and settings.
- Make the tabs keyboard-accessible, with clear selected, hover, and focus states. On narrow screens, keep the tab row usable with horizontal scrolling rather than compressing labels.

## Settings and display rules
- `backgroundColor` controls the shared panel and selected tab using the existing Primary/Secondary theme colors and matching contrast text.
- Unselected tabs use the standard muted surface.
- `fullWidth` controls whether the section spans the viewport or stays within the site content width.
- `boxed` constrains and visually contains the section; `border` adds a semantic border when enabled.
- Preserve duplicate labels such as “Text” by using the CMS item ID as the tab identity.
- `sectionNavigationItem` is a nested data item, so it will be silently handled rather than shown as a missing block.
- `hideForSome` only hides an item when it names matching `memberGroups`; with `memberGroups: null`, the section remains visible because this frontend currently has no member-group session context.

## Technical details
- Create a focused `SectionNavigation.tsx` component using the existing Tabs control and `BlockListRenderer`.
- Register the exact `sectionNavigation` alias and add `sectionNavigationItem` to the intentional nested-item aliases.
- Use existing semantic color, border, and spacing tokens; no screenshot assets or hardcoded brand colors.
- Verify the block in the live preview at desktop and mobile widths, including tab switching and nested media rendering.
