import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bricks" },
      { name: "description", content: "Headless Umbraco frontend — Phase 2 design shell." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Phase 2 — Design system
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-text-dark">
          Bricks frontend shell
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-text-grey">
          Fira Sans is loaded, color tokens are wired, and the header/footer shell
          is in place. Phase 3 will render real Umbraco blocks inside this layout.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Primary", className: "bg-primary text-primary-foreground" },
            { name: "Secondary", className: "bg-secondary text-secondary-foreground" },
            { name: "Accent", className: "bg-accent text-accent-foreground" },
            { name: "Onyx", className: "bg-brand-onyx text-text-light" },
            { name: "Muted teal", className: "bg-brand-muted-teal text-brand-onyx" },
            { name: "Lilac", className: "bg-brand-lilac text-brand-onyx" },
            { name: "Lavender blush", className: "bg-brand-lavender-blush text-brand-mauve-shadow" },
            { name: "Mauve shadow", className: "bg-brand-mauve-shadow text-brand-lavender-blush" },
          ].map((swatch) => (
            <div
              key={swatch.name}
              className={`flex h-24 items-end rounded-lg p-4 text-sm font-medium ${swatch.className}`}
            >
              {swatch.name}
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
