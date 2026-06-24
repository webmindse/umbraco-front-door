# Rich-Text Checklist

Follow every step when a block renders an RTE field (typically
`textContent.markup` or a similar `{ markup }` envelope).

## 1. Verify the typography plugin (auto-install if missing)

The `prose-*` classes only work when `@tailwindcss/typography` is installed
and registered. Before writing the block:

1. Check `package.json` for `@tailwindcss/typography`.
2. Check `src/styles.css` for `@plugin "@tailwindcss/typography";`.

If either is missing:

```bash
bun add -d @tailwindcss/typography
```

Add the plugin line to `src/styles.css` near the top (after `@import "tailwindcss";`):

```css
@plugin "@tailwindcss/typography";
```

Do this proactively — do not wait for the user to report broken heading
sizes or link colors.

## 2. Use the project's `RichTextRenderer`

Never call `dangerouslySetInnerHTML` directly. The shared `RichTextRenderer`
already:

- Accepts the `{ markup }` envelope or a raw HTML string.
- Rewrites root-relative URLs (`/media/...`) in `<img src>` and `<a href>` to
  the Umbraco origin via `VITE_UMBRACO_PUBLIC_BASE_URL`. Without this, CMS
  images are broken on the frontend.

Pass styling via the renderer's `className` prop.

## 3. Standard prose classes

Apply these via `className` on `RichTextRenderer`:

- **Sizes**: `prose-sm md:prose-base`, plus
  `prose-h1:text-3xl md:prose-h1:text-4xl`,
  `prose-h2:text-2xl md:prose-h2:text-3xl`,
  `prose-h3:text-xl md:prose-h3:text-2xl`.
- **Headings**: `prose-headings:font-semibold prose-headings:tracking-tight`.
- **Links (always primary so they read as links)**:
  `prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80`.
- **On dark backgrounds** (when `backgroundColor` is Primary/Secondary):
  `prose-invert prose-headings:text-text-light prose-p:text-text-light/90 prose-strong:text-text-light prose-hr:border-text-light/30 prose-figcaption:text-text-light/70`.

## 4. Color rules

Never hardcode `text-white`, `bg-black`, or arbitrary hex utilities. Use
the project's semantic tokens (`text-text-light`, `text-primary`, etc.).
This keeps theming consistent and dark-mode-correct.

## 5. Verify after build

After implementing, re-check rendered output against the payload: headings
sized correctly, links visibly distinct, images load (not broken), and dark
backgrounds invert text colors. The `Text.tsx` block is the canonical RTE
exemplar.
