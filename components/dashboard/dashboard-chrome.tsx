"use client";

import { useEffect } from "react";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import { ToastProvider } from "@/components/dashboard/toast";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function DashboardChrome({
  area,
  email,
  children,
}: {
  area: "admin" | "brand";
  email: string;
  children: React.ReactNode;
}) {
  // Base UI portals (dialogs, dropdowns, selects, tooltips) render to
  // document.body, outside the [data-dashboard] wrapper below, so they
  // wouldn't see its scoped CSS variables. Mirror the attribute onto body
  // too — safe from FOUC since portaled content is never open before this
  // effect runs (nothing can trigger one before hydration completes), and
  // the visible chrome below still gets correct SSR-time styling from its
  // own wrapper.
  useEffect(() => {
    document.body.setAttribute("data-dashboard", "");
    return () => {
      document.body.removeAttribute("data-dashboard");
    };
  }, []);

  return (
    <div data-dashboard>
      <SidebarProvider>
        <AppSidebar area={area} email={email} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <p className="text-sm font-semibold">{area === "admin" ? "Admin Panel" : "Brand Portal"}</p>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>
          <ToastProvider>
            <div className="min-w-0 flex-1 p-4 md:p-6">{children}</div>
          </ToastProvider>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
