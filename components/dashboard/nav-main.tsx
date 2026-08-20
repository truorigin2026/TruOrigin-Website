"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavGroup, NavLink } from "@/components/dashboard/nav-config";

function isLinkActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/brand/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ link, pathname }: { link: NavLink; pathname: string }) {
  const Icon = link.icon;
  const active = isLinkActive(pathname, link.href);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={link.label} isActive={active} render={<Link prefetch={false} href={link.href} />}>
        <Icon />
        <span>{link.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ groups, links }: { groups?: NavGroup[]; links?: NavLink[] }) {
  const pathname = usePathname();

  if (links) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {links.map((link) => (
              <NavRow key={link.href} link={link} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      {groups?.map(({ group, links: groupLinks }) => (
        <SidebarGroup key={group}>
          <SidebarGroupLabel>{group}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupLinks.map((link) => (
                <NavRow key={link.href} link={link} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
