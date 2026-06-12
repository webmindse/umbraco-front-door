/**
 * Site footer shell. Phase 4 will pull footer content from Umbraco globals.
 */
export function SiteFooter() {
  return (
    <footer className="mt-24 w-full bg-background-secondary text-text-light">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm opacity-70">
          © {new Date().getFullYear()} Bricks — footer content loads from CMS in Phase 4.
        </p>
      </div>
    </footer>
  );
}
