"use client";

import Link from "next/link";
import favicon from "@/favicon.png";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import { adminNavGroups, brandNavLinks } from "@/components/dashboard/nav-config";

export function AppSidebar({ area, email }: { area: "admin" | "brand"; email: string }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link prefetch={false} href={area === "admin" ? "/admin" : "/brand/dashboard"} />}>
              <img src={favicon.src} alt="" className="size-7 shrink-0 rounded-full" />
              <span className="font-semibold text-base">{area === "admin" ? "Admin" : "Brand Portal"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {area === "admin" ? <NavMain groups={adminNavGroups} /> : <NavMain links={brandNavLinks} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={email} areaLabel={area === "admin" ? "Admin" : "Brand"} />
      </SidebarFooter>
    </Sidebar>
  );
}
