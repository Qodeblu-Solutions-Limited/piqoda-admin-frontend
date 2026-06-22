"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getApiUrl, getStoredToken } from "@/lib/auth";
import { useTranslations } from "next-intl";

type SubscriptionItem = {
  id: string;
  plan: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  metadata: string | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

const SubscriptionsPage = () => {
  const t = useTranslations("Menu");
  const [subscriptions, setSubscriptions] = React.useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadSubscriptions = async () => {
      setLoading(true);
      setError(null);
      const token = getStoredToken();
      if (!token) {
        setError("Admin token missing. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${getApiUrl()}/subscriptions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to fetch ongoing subscriptions (${response.status})`);
        }

        const data = await response.json();

        if (data.status !== "ok" || !Array.isArray(data.subscriptions)) {
          throw new Error("Invalid ongoing subscriptions response");
        }

        setSubscriptions(data.subscriptions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ongoing subscriptions");
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-default-200 bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold">{t("ongoingSubscriptions")}</p>
              <p className="text-sm text-default-500">View all active subscriptions and user details.</p>
            </div>
            <Button variant="outline" color="secondary" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-default-200 bg-background p-6 shadow-sm">
        {loading ? (
          <p>Loading ongoing subscriptions…</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-sm text-default-500">No ongoing subscriptions found.</p>
        ) : (
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{subscription.user.email}</span>
                      {subscription.user.name ? <span className="text-xs text-default-500">{subscription.user.name}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell>{subscription.plan}</TableCell>
                  <TableCell>{subscription.status}</TableCell>
                  <TableCell>{new Date(Number(subscription.startedAt)).toLocaleDateString()}</TableCell>
                  <TableCell>{subscription.expiresAt ? new Date(Number(subscription.expiresAt)).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right text-xs text-default-500">
                    {subscription.metadata ? subscription.metadata : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
