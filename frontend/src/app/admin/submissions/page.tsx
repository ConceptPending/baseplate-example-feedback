"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { StatusPill } from "@/components/ui/StatusPill";
import { listSubmissions, reviewSubmission } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import type { Submission, SubmissionStatus } from "@/lib/types";

const FILTERS: { label: string; value: SubmissionStatus | "all" }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

export default function SubmissionsPage() {
  const [filter, setFilter] = useState<SubmissionStatus | "all">("pending");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    listSubmissions(filter === "all" ? undefined : filter)
      .then(setSubmissions)
      .catch((err) =>
        setError(errorMessage(err, "Failed to load submissions")),
      );
  };

  useEffect(load, [filter]);

  async function setStatus(id: string, status: SubmissionStatus) {
    setBusyId(id);
    try {
      await reviewSubmission(id, { status });
      load();
    } catch (err) {
      setError(errorMessage(err, "Failed to update submission"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Submissions</h1>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                filter === f.value
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {submissions.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          No {filter === "all" ? "" : filter} submissions yet.
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.email} · {new Date(s.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusPill status={s.status} />
              </div>
              <p className="text-sm mb-4 whitespace-pre-wrap">{s.message}</p>
              {s.reviewer_notes && (
                <p className="text-xs text-muted italic mb-3">
                  Reviewer notes: {s.reviewer_notes}
                </p>
              )}
              {s.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === s.id}
                    onClick={() => setStatus(s.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === s.id}
                    onClick={() => setStatus(s.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
