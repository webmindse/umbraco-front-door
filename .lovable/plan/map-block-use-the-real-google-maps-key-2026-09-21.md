# Map block: use the real Google Maps key

The map currently always renders the keyless embed, because the key value that reached the code looked like a placeholder. The CMS actually stores a real key (`AIzaSy...`), so the block should use the official Google Maps Embed API when a valid-looking key is present.

## What changes

- When `googleMapsKey` looks like a real key (starts with `AIza`, no `@secret:` / `$` placeholder marker), render the official embed:
  `https://www.google.com/maps/embed/v1/place?key=<key>&q=<lat>,<lng>&zoom=<zoom>`
  This gives the proper Google map with Karta/Satellit tabs, a real marker and full controls.
- When the key is missing or still a placeholder, keep today's keyless embed as the fallback, so the block never breaks.
- If Google rejects the key, the iframe shows Google's own "can't load" panel. To make that obvious rather than silent, keep the fallback logic simple and log nothing user-facing; no extra error UI.
- Also handle percentage values for `height` (e.g. `60%`) by treating them as a viewport-relative height instead of ignoring them, so the CMS height setting has an effect.

## What you need to do

For the key to work on your published site, it must allow the domains it runs on. In Google Cloud Console, on that API key:

1. Enable the **Maps Embed API**.
2. Under application restrictions, either choose "None", or add HTTP referrers for your preview and live domains (`https://*.lovable.app/*`, `https://*.lovableproject.com/*`, and your custom domain).

Nothing else is needed from you — the key comes straight from the CMS payload.

## Not included

`customMapPinIcon` (a custom marker image) is not possible with the Embed API; it requires the Maps JavaScript API and a different implementation. Say the word if you want that later.

## Technical notes

Single file: `src/components/umbraco/blocks/Map.tsx`. Key validation is a small helper (`isUsableKey`) guarding which iframe `src` is built; the layout, colours, contact rows and placement logic stay as they are. The key is embedded in the iframe URL and therefore visible client-side — that is normal for Maps Embed, which is why referrer restrictions matter.
