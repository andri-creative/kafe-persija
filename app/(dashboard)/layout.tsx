import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NavUser } from "@/components/nav-user";
import { FullScreen } from "@/components/full-screen";
import { cookies } from "next/headers";
import PageTransitionProvider from "@/components/PageTransitionProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState ? sidebarState === "true" : true;

  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumbs />
              </div>
              <div className="flex items-center justify-end gap-2">
                <FullScreen />
                <NavUser />
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 px-6 py-4">
            <PageTransitionProvider>
                <div className="flex-1">{children}</div>
            </PageTransitionProvider>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
