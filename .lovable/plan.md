## Goal
Make the app deployable to Netlify while keeping local/Lovable development working.

## Why this is safe for ongoing work
The nitro `preset` only affects the production build output. The Lovable preview and `bun dev` use Vite's dev server, which is preset-agnostic — switching from `cloudflare` (default) to `netlify` does not change anything you see while editing.

## Changes

### 1. `vite.config.ts` — switch nitro preset to Netlify
Add a `nitro: { preset: "netlify" }` option to the existing `defineConfig({...})` call, per the recipe in `DEPLOYMENT.md`. This makes `bun run build` emit Netlify Functions output instead of a Cloudflare Worker bundle.

### 2. `netlify.toml` (new, optional but recommended)
Pin the build command and Node version so Netlify's build image matches what we use locally:

```toml
[build]
  command = "bun run build"

[build.environment]
  NODE_VERSION = "20"
```

Publish directory is left to the Netlify nitro preset (it configures the output location automatically).

### 3. Environment variables — configured in Netlify dashboard (no code change)
You'll add these in Site → Site configuration → Environment variables (scoped to Production + Deploy previews):

- `UMBRACO_BASE_URL` = `https://bricksdemo.euwest01.umbraco.io`
- `UMBRACO_API_KEY` = (your Umbraco Headless Delivery API key)
- `VITE_UMBRACO_PUBLIC_BASE_URL` = `https://bricksdemo.euwest01.umbraco.io` (optional, only if client code references it)
- `UMBRACO_START_ITEM` = (only if your CMS uses one)

No app code changes are needed — `process.env.*` is read inside server function handlers at runtime, which works identically on Netlify Functions and the Cloudflare Worker target.

## Out of scope
- No changes to server functions, routes, components, or the dev server.
- Not running the build locally to validate (the Lovable harness will run typecheck/build after the edit).
- Not touching Lovable Cloud / Supabase config — there isn't any to migrate.

## After this lands
1. Push to the branch connected to Netlify.
2. Add the env vars above in the Netlify dashboard.
3. Trigger a deploy. If anything fails, check the Netlify build log and the `/_debug/umbraco` route on the deployed site.
