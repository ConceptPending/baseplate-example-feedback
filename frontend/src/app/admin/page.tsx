"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { listSubmissions } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Submission } from "@/lib/types";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSubmissions()
      .then(setSubmissions)
      .catch((err) =>
        setError(errorMessage(err, "Failed to load submissions")),
      );
  }, []);

  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        Dashboard
      </h1>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-sm text-muted">Pending review</p>
          <p className="mt-1 text-3xl font-semibold">{pending}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Approved</p>
          <p className="mt-1 text-3xl font-semibold">{approved}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted">Rejected</p>
          <p className="mt-1 text-3xl font-semibold">{rejected}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent submissions</h2>
          <Link
            href="/admin/submissions"
            className="text-xs text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {submissions.slice(0, 5).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b border-border pb-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {s.email} · {s.status}
                </p>
              </div>
            </div>
          ))}
          {submissions.length === 0 && (
            <p className="text-sm text-muted">No submissions yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
