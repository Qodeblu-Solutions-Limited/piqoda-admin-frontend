"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getApiUrl, getStoredToken } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { useTranslations } from "next-intl";

type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  currency: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyDiscountPercent: number;
  annualDiscountPercent: number;
  monthlyPriceAfterDiscount: number;
  annualPriceAfterDiscount: number;
  priceMetadata: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type PlanForm = {
  name: string;
  slug: string;
  description: string;
  currency: string;
  monthlyPrice: string;
  annualPrice: string;
  monthlyDiscountPercent: string;
  annualDiscountPercent: string;
  isActive: boolean;
  displayOrder: string;
};

const defaultForm: PlanForm = {
  name: "",
  slug: "",
  description: "",
  currency: "USD",
  monthlyPrice: "0",
  annualPrice: "0",
  monthlyDiscountPercent: "0",
  annualDiscountPercent: "0",
  isActive: true,
  displayOrder: "0",
};

const parseNumber = (value: string) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatCurrencyValue = (value: number) => String(Number(value.toFixed(2)));

const getMonthlyPriceAfterDiscount = (monthlyPrice: number, monthlyDiscountPercent: number) =>
  monthlyPrice * (1 - monthlyDiscountPercent / 100);

const getAnnualPriceFromMonthly = (monthlyPrice: number) => monthlyPrice * 12;

const getAnnualPriceAfterDiscount = (annualPrice: number, annualDiscountPercent: number) =>
  annualPrice * (1 - annualDiscountPercent / 100);

const PlansPage = () => {
  const t = useTranslations("Menu");
  const [plans, setPlans] = React.useState<SubscriptionPlan[]>([]);
  const [form, setForm] = React.useState<PlanForm>(defaultForm);
  const [editingPlanId, setEditingPlanId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadPlans = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getStoredToken();
    if (!token) {
      setError("Admin token missing. Please sign in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/subscription-plans?showInactive=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to load subscription plans (${response.status})`);
      }

      const data = await response.json();
      if (data.status !== "ok" || !Array.isArray(data.plans)) {
        throw new Error("Invalid subscription plans response");
      }

      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const resetForm = () => {
    setEditingPlanId(null);
    setForm(defaultForm);
    setError(null);
  };

  const handleChange = (key: keyof PlanForm, value: string | boolean) => {
    setForm((prev) => {
      const nextState = { ...prev, [key]: value };
      const monthlyPrice = parseNumber(nextState.monthlyPrice);
      const monthlyDiscountPercent = parseNumber(nextState.monthlyDiscountPercent);
      const annualDiscountPercent = parseNumber(nextState.annualDiscountPercent);

      if (key === "monthlyPrice") {
        nextState.annualPrice = formatCurrencyValue(getAnnualPriceFromMonthly(monthlyPrice));
      }

      if (key === "monthlyDiscountPercent" || key === "annualDiscountPercent") {
        if (!nextState.annualPrice || key === "monthlyDiscountPercent") {
          nextState.annualPrice = formatCurrencyValue(getAnnualPriceFromMonthly(monthlyPrice));
        }
      }

      return nextState;
    });
  };

  const monthlyValue = parseNumber(form.monthlyPrice);
  const annualValue = getAnnualPriceFromMonthly(monthlyValue);
  const monthlyPriceAfterDiscount = getMonthlyPriceAfterDiscount(
    monthlyValue,
    parseNumber(form.monthlyDiscountPercent)
  );
  const annualPriceAfterDiscount = getAnnualPriceAfterDiscount(
    annualValue,
    parseNumber(form.annualDiscountPercent)
  );

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description ?? "",
      currency: plan.currency,
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      monthlyDiscountPercent: String(plan.monthlyDiscountPercent),
      annualDiscountPercent: String(plan.annualDiscountPercent),
      isActive: plan.isActive,
      displayOrder: String(plan.displayOrder),
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const token = getStoredToken();

    if (!token) {
      setError("Admin token missing. Please sign in again.");
      setSaving(false);
      return;
    }

    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      setSaving(false);
      return;
    }

    const monthlyPrice = parseNumber(form.monthlyPrice);
    const annualPrice = getAnnualPriceFromMonthly(monthlyPrice);
    const monthlyDiscountPercent = parseNumber(form.monthlyDiscountPercent);
    const annualDiscountPercent = parseNumber(form.annualDiscountPercent);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      currency: form.currency.trim() || "USD",
      monthlyPrice,
      annualPrice,
      monthlyDiscountPercent,
      annualDiscountPercent,
      monthlyPriceAfterDiscount: getMonthlyPriceAfterDiscount(monthlyPrice, monthlyDiscountPercent),
      annualPriceAfterDiscount: getAnnualPriceAfterDiscount(annualPrice, annualDiscountPercent),
      priceMetadata: JSON.stringify({ period: monthlyPrice === 0 ? "Forever" : "/month" }),
      isActive: form.isActive,
      displayOrder: Number(form.displayOrder),
    };

    try {
      const url = `${getApiUrl()}/subscription-plans${editingPlanId ? `/${editingPlanId}` : ""}`;
      const response = await fetch(url, {
        method: editingPlanId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Unable to save subscription plan (${response.status})`);
      }

      await loadPlans();
      resetForm();
      toast({
        title: editingPlanId ? "Subscription plan updated" : "Subscription plan created",
        description: editingPlanId
          ? "Your plan changes have been saved."
          : "A new plan has been added successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save subscription plan");
      toast({
        title: "Unable to save plan",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: string) => {
    const confirmed = window.confirm("Delete this subscription plan? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError(null);
    const token = getStoredToken();

    if (!token) {
      setError("Admin token missing. Please sign in again.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/subscription-plans/${planId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `Unable to delete subscription plan (${response.status})`);
      }

      if (editingPlanId === planId) {
        resetForm();
      }

      await loadPlans();
      toast({
        title: "Subscription plan deleted",
        description: "The plan has been removed successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subscription plan");
      toast({
        title: "Unable to delete plan",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-default-200 bg-background p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{t("subscriptionPlans")}</p>
            <p className="text-sm text-default-500">Create, edit or delete subscription plans.</p>
          </div>
          <Button variant="outline" color="secondary" onClick={resetForm}>
            New plan
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-default-200 bg-muted p-4">
            <p className="font-semibold">{editingPlanId ? "Edit plan" : "New plan"}</p>
            <div className="grid gap-3">
              <label className="space-y-1 text-sm font-medium">
                <span>Plan name</span>
                <Input
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Enter a plan name"
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                <span>Slug</span>
                <Input
                  value={form.slug}
                  onChange={(event) => handleChange("slug", event.target.value)}
                  placeholder="Enter a unique slug"
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange("description", event.target.value)}
                  className="h-24 w-full rounded-md border border-default-200 bg-background px-3 py-2 text-sm text-default outline-none focus:border-primary"
                  placeholder="Describe the plan benefits"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Monthly price</span>
                  <Input
                    type="number"
                    value={form.monthlyPrice}
                    onChange={(event) => handleChange("monthlyPrice", event.target.value)}
                    placeholder="0.00"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>Calculated annual price</span>
                  <Input
                    type="number"
                    value={formatCurrencyValue(annualValue)}
                    readOnly
                    className="cursor-not-allowed"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Monthly discount (%)</span>
                  <Input
                    type="number"
                    value={form.monthlyDiscountPercent}
                    onChange={(event) => handleChange("monthlyDiscountPercent", event.target.value)}
                    placeholder="0"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>Annual discount (%)</span>
                  <Input
                    type="number"
                    value={form.annualDiscountPercent}
                    onChange={(event) => handleChange("annualDiscountPercent", event.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-sm font-medium">
                  <p>Monthly price after discount</p>
                  <div className="rounded-md border border-default-200 bg-background px-3 py-2 text-sm text-default">
                    {formatCurrencyValue(monthlyPriceAfterDiscount)}
                  </div>
                </div>
                <div className="space-y-1 text-sm font-medium">
                  <p>Annual price after discount</p>
                  <div className="rounded-md border border-default-200 bg-background px-3 py-2 text-sm text-default">
                    {formatCurrencyValue(annualPriceAfterDiscount)}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Currency</span>
                  <Input
                    value={form.currency}
                    onChange={(event) => handleChange("currency", event.target.value)}
                    placeholder="USD"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>Display order</span>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(event) => handleChange("displayOrder", event.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => handleChange("isActive", event.target.checked)}
                    className="h-4 w-4 rounded border-default-300 text-primary focus:ring-primary"
                  />
                  <span>Active plan</span>
                </label>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : editingPlanId ? "Update plan" : "Create plan"}
                </Button>
                {editingPlanId ? (
                  <Button variant="outline" color="destructive" onClick={() => handleDelete(editingPlanId)} disabled={saving}>
                    Delete plan
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-default-200 bg-background">
            <div className="border-b border-default-200 bg-default/50 px-4 py-3 font-semibold">All plans</div>
            <div className="p-4">
              {loading ? (
                <p>Loading plans…</p>
              ) : plans.length === 0 ? (
                <p className="text-sm text-default-500">No plans found.</p>
              ) : (
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>{plan.name}</TableCell>
                        <TableCell>{plan.slug}</TableCell>
                        <TableCell>
                          {plan.currency} {plan.monthlyPrice.toFixed(2)} /month
                        </TableCell>
                        <TableCell>{plan.isActive ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansPage;
