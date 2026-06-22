"use client";

import React from "react";
import { usePathname } from "@/components/navigation";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("Menu");

  const tabs = [
    { href: "/subscriptions", label: t("ongoingSubscriptions") },
    { href: "/subscriptions/plans", label: t("subscriptionPlans") },
  ];

  const isActiveTab = (href: string) =>
    pathname === href || pathname.endsWith(href) || pathname.includes(`${href}/`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("subscriptions")}</h1>
          <p className="text-sm text-default-500">{t("subscriptionsDescription")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-default bg-default text-default-foreground"
                    : "border-default-200 bg-background text-default hover:border-default hover:bg-default/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
