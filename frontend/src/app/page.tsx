import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
          <h1 className="text-4xl font-semibold tracking-tight mb-4">
            Feedback Inbox
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-8">
            Got a suggestion, a bug report, or something we should know?
            Send it our way. A real person reads every message.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center rounded-full bg-accent text-white font-semibold px-6 py-3 text-sm hover:bg-accent-bright transition-colors"
          >
            Submit feedback
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
