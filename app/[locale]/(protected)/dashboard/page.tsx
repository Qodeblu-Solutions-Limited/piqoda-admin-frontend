'use client'

import React, { useEffect, useMemo, useState } from "react";
import { getApiUrl, getStoredToken } from "@/lib/auth";

type AnalyticsSessionSummary = {
  sessionId: string;
  startTs: number;
  durationMs: number;
};

type AnalyticsSummary = {
  sessionCount: number;
  actionCount: number;
  actionBreakdown: Record<string, number>;
  recentSessions: AnalyticsSessionSummary[];
};

const DashboardPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setError("Admin token missing. Please sign in again.");
      setLoading(false);
      return;
    }

    async function loadAnalytics() {
      setLoading(true);
      setError(null);

      try {
const response = await fetch(`${getApiUrl()}/analytics/admin/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || `Analytics fetch failed (${response.status})`);
        }

        const data = await response.json();
        setSummary(data as AnalyticsSummary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load analytics summary.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const topActions = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.actionBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [summary]);

  const formatDuration = (durationMs: number) => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    return minutes > 0
      ? `${minutes}m ${remainderSeconds}s`
      : `${remainderSeconds}s`;
  };

  const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp));

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live analytics pulled from the backend activity summary for the signed-in admin.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border/50 bg-card/40 p-8 text-center text-sm text-muted-foreground">
          Loading analytics…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-sm text-destructive">
          {error}
        </div>
      ) : summary ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Sessions</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">{summary.sessionCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Total tracked user sessions</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Events</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">{summary.actionCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">Total analytics events captured</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Most common action</p>
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {topActions.length > 0 ? topActions[0][0] : "No events yet"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {topActions.length > 0 ? `${topActions[0][1]} occurrences` : "No action data"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <h2 className="text-xl font-semibold text-foreground">Action breakdown</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Top action types tracked for this admin user.
              </p>
              {topActions.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">No analytics events available yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {topActions.map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/80 p-3">
                      <span className="text-sm text-foreground">{action}</span>
                      <span className="text-sm font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Recent sessions</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Latest session starts and durations.</p>
                </div>
              </div>

              {summary.recentSessions.length === 0 ? (
                <p className="mt-6 text-sm text-muted-foreground">No sessions available yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {summary.recentSessions.slice(0, 5).map((session) => (
                    <div key={session.sessionId} className="rounded-xl border border-border/30 bg-background/80 p-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium text-foreground">{session.sessionId}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(session.startTs)}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>Duration: {formatDuration(session.durationMs)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardPage;
