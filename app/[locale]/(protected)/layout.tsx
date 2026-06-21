import LayoutProvider from "@/providers/layout.provider";
import LayoutContentProvider from "@/providers/content.provider";
import DashBoardSidebar from "@/components/partials/sidebar";
import DashBoardFooter from "@/components/partials/footer";
import DashBoardHeader from "@/components/partials/header";
const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutProvider>
      <DashBoardHeader />
      <DashBoardSidebar />
      <LayoutContentProvider>{children}</LayoutContentProvider>
      <DashBoardFooter />
    </LayoutProvider>
  );
};

export default layout;
