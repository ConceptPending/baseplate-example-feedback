import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Feedback Inbox</p>
            <p className="mt-1 text-sm text-muted max-w-xs">
              Send us a note. We read every submission.
            </p>
          </div>

          <nav className="flex gap-6">
            <Link
              href="/submit"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Submit
            </Link>
          </nav>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted">
            Built on{" "}
            <a
              href="https://github.com/ConceptPending/baseplate"
              className="hover:text-foreground"
            >
              Baseplate
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
