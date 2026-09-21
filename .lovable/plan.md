# Fix text contrast on coloured backgrounds — generally

## The problem

Blocks that sit on a coloured background (green "Primary", "Secondary") set the correct
readable text colour on their wrapper, but the rich-text areas inside ignore it and fall
back to a fixed dark grey. That is why the Contacts heading and intro are dark-on-dark.

Today each block works around this individually with its own list of colour overrides
(Text, Video, Accordion, Map, Counters, Download list, Latest-from-feed each do their own
version). Blocks that forgot the workaround — like Contacts — break. New blocks will keep
breaking the same way.

## The fix

Make rich text inherit the surrounding text colour by default, everywhere.

1. Add one reusable styling rule that makes all rich-text parts (headings, paragraphs,
   bold text, lists, quotes, captions, rules) use the colour of whatever they sit in.
2. Apply it inside the shared rich-text renderer, so every block gets it automatically
   with no per-block work.
3. Remove the now-redundant per-block colour overrides so there is a single source of
   truth, keeping each block's non-colour styling (sizes, spacing, link styles) intact.
4. Keep links visually distinct: links stay underlined and, on coloured backgrounds,
   use the same inherited colour rather than a fixed link colour that can clash.
5. Sweep the remaining blocks for hard-coded muted/dark text that sits directly on a
   coloured panel (not inside a white card) and switch those to the inherited colour too.

After this, a block only has to set its background and matching contrast colour once, and
everything inside it stays readable.

## Verification

Check the Contacts block plus the other coloured-background blocks (Text, Map, Accordion,
Counters, Video, Download list, Latest from feed) on both the green and light backgrounds,
confirming headings, body text and links are all readable and nothing lost its styling.

## Technical notes

- Add a `@utility prose-inherit` in `src/styles.css` setting the `--tw-prose-*` variables
  (body, headings, bold, lead, links, counters, bullets, hr, quotes, captions, code) to
  `currentColor`, with muted parts using `color-mix(... currentColor 75%, transparent)`.
- Apply `prose-inherit` in `RichTextRenderer`'s base class list, before the incoming
  `className`, so per-block overrides can still win when genuinely needed.
- Drop `dark:prose-invert` from the renderer and the `prose-invert` / `prose-*:text-*`
  colour overrides in `Text.tsx`, `Video.tsx`, `Accordion.tsx`, `Map.tsx`, `Counters.tsx`,
  `DownloadList.tsx`, `LatestFromFeed.tsx`.
- In `Contacts.tsx`, the card body stays on `bg-card`, so its `text-muted-foreground`
  rows are fine; only the section-level intro relies on the inherited contrast colour.
