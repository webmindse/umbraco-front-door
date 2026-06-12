import { Link } from "@tanstack/react-router";

/**
 * Site header shell. Phase 4 will replace the hard-coded nav items with
 * data from Umbraco (root children of the start item).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-nav-background text-text-light">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Bricks
        </Link>
        <nav aria-label="Primary" className="hidden gap-6 text-sm md:flex">
          {/* Phase 4: replace with CMS-driven items */}
          <span className="opacity-60">Nav loads from CMS in Phase 4</span>
        </nav>
      </div>
    </header>
  );
}
