"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Input } from "@/components/ui/Input";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { submitFeedback } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { SubmissionCreate } from "@/lib/types";

export default function SubmitPage() {
  const [form, setForm] = useState<SubmissionCreate>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitFeedback(form);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Submission failed — please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-lg px-4 sm:px-6 py-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Send feedback
          </h1>
          <p className="text-sm text-muted mb-8">
            We read every submission and respond when relevant. No public
            account needed.
          </p>

          {sent ? (
            <Card className="p-6 text-center">
              <p className="text-lg font-medium mb-2">Thanks — got it.</p>
              <p className="text-sm text-muted mb-6">
                We&apos;ll review your submission and follow up if needed.
              </p>
              <Link
                href="/"
                className="text-sm text-accent hover:underline"
              >
                Back to home
              </Link>
            </Card>
          ) : (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorBanner
                  error={error}
                  onDismiss={() => setError(null)}
                />
                <Input
                  id="name"
                  label="Your name"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
                <Input
                  id="email"
                  type="email"
                  label="Email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-muted mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    maxLength={10000}
                    rows={6}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? "Sending..." : "Submit"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
