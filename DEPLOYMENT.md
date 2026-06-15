# Deployment

This app is a TanStack Start v1 project built with Vite 7. The default build
target is Cloudflare (via nitro's `cloudflare` preset, configured by
`@lovable.dev/vite-tanstack-config`). To deploy to **Vercel** or **Netlify**
instead, you need to (a) switch the nitro preset and (b) configure the same
runtime environment variables that Lovable's secrets store provides in the
hosted environment.

No application code changes are required — secrets are read the standard way
(`process.env.UMBRACO_*`) inside server function handlers, so any host that
injects them into the server runtime works.

## Environment variables

Server-side (runtime, used inside `.handler()` of server functions):

| Name                  | Required | Notes                                          |
| --------------------- | -------- | ---------------------------------------------- |
| `UMBRACO_BASE_URL`    | Yes      | e.g. `https://bricksdemo.euwest01.umbraco.io`  |
| `UMBRACO_API_KEY`     | Yes      | Umbraco Headless Delivery API key (secret)     |
| `UMBRACO_START_ITEM`  | No       | Only if your CMS uses a start item             |

Client-side (build-time, inlined by Vite into the browser bundle):

| Name                          | Required | Notes                                        |
| ----------------------------- | -------- | -------------------------------------------- |
| `VITE_UMBRACO_PUBLIC_BASE_URL`| No       | Only needed if/when client code references it|

Only `UMBRACO_API_KEY` is genuinely sensitive. The base URL is public (it's
the CMS origin a browser would hit directly), but it must still be available
in the server runtime, hence it's also configured per host below.

## Vercel

1. **Switch the nitro preset to Vercel.** Edit `vite.config.ts`:

   ```ts
   import { defineConfig } from "@lovable.dev/vite-tanstack-config";

   export default defineConfig({
     tanstackStart: { server: { entry: "server" } },
     nitro: { preset: "vercel" },
   });
   ```

2. **Add environment variables** in the Vercel dashboard:
   Project → Settings → Environment Variables. Add `UMBRACO_BASE_URL`,
   `UMBRACO_API_KEY`, and (optionally) `UMBRACO_START_ITEM` for the
   environments you want (Production / Preview / Development). If you use
   `VITE_UMBRACO_PUBLIC_BASE_URL`, add it too — Vercel makes it available at
   build time so Vite can inline it.

3. **Build settings.** Framework preset: "Other". Build command: `bun run build`
   (or `npm run build`). Output directory: leave blank — the Vercel preset
   writes to `.vercel/output` automatically.

4. **Deploy.** Push to the connected git branch or run `vercel --prod`.

Notes:
- The Vercel preset deploys server functions as Vercel Functions (Node runtime
  by default). All Node built-ins used by this project are supported.
- Secrets are injected into `process.env` at runtime — no code changes needed.

## Netlify

1. **Switch the nitro preset to Netlify.** Edit `vite.config.ts`:

   ```ts
   import { defineConfig } from "@lovable.dev/vite-tanstack-config";

   export default defineConfig({
     tanstackStart: { server: { entry: "server" } },
     nitro: { preset: "netlify" },
   });
   ```

   (Use `netlify_edge` instead if you want Netlify Edge Functions / Deno
   runtime. The standard `netlify` preset uses Netlify Functions / Node and
   matches what this app needs.)

2. **Add environment variables** in the Netlify dashboard:
   Site → Site configuration → Environment variables. Add `UMBRACO_BASE_URL`,
   `UMBRACO_API_KEY`, and (optionally) `UMBRACO_START_ITEM` and
   `VITE_UMBRACO_PUBLIC_BASE_URL`. Scope to the deploy contexts you need
   (Production, Deploy previews, Branch deploys).

3. **Build settings.** Build command: `bun run build` (or `npm run build`).
   Publish directory: leave blank — the Netlify preset configures the output
   location automatically. A `netlify.toml` is not required, but you can add
   one if you want to pin the build command and Node version:

   ```toml
   [build]
     command = "bun run build"

   [build.environment]
     NODE_VERSION = "20"
   ```

4. **Deploy.** Push to the connected git branch or run `netlify deploy --prod`.

## Local development

Create `.env.local` in the project root with the same variables (it is
gitignored by Vite). Vite reads it for both build-time `VITE_*` vars and
server-runtime `process.env.*` during `bun dev`.

```
UMBRACO_BASE_URL=https://bricksdemo.euwest01.umbraco.io
UMBRACO_API_KEY=...
# UMBRACO_START_ITEM=
# VITE_UMBRACO_PUBLIC_BASE_URL=https://bricksdemo.euwest01.umbraco.io
```

## Verifying a deploy

After deploying, hit the home route and the `/_debug/umbraco` route. If the
CMS isn't reachable, the server logs will show `[umbraco] <status> for <path>`
with the upstream status — almost always either a missing/invalid
`UMBRACO_API_KEY` (401) or a misconfigured `UMBRACO_BASE_URL` (DNS/404).
