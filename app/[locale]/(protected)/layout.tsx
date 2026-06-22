'use client';

import React from "react";
import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashBoardSidebar from "@/components/partials/sidebar";
import DashBoardFooter from "@/components/partials/footer";
import DashBoardHeader from "@/components/partials/header";
import { useRouter } from '@/i18n/routing';
import { isAuthenticated } from '@/lib/auth';
import { useLocale } from "next-intl";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const locale = useLocale();
  const [checkedAuth, setCheckedAuth] = React.useState(false);

  React.useEffect(() => {
    const authenticated = isAuthenticated();
    if (!authenticated) {
      router.replace('/signin', { locale });
      return;
    }
    setCheckedAuth(true);
  }, [router, locale]);

  if (!checkedAuth) {
    return null;
  }

  return (
    <LayoutProvider>
      <DashBoardHeader />
      <DashBoardSidebar />
      <LayoutContentProvider>{children}</LayoutContentProvider>
      <DashBoardFooter />
    </LayoutProvider>
  );
};

export default ProtectedLayout;
