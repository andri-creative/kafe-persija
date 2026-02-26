"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  FolderTree,
  Palette,
  GalleryVerticalEnd,
  LucideIcon,
  User,
  Users,
  ShieldAlert,
  ShieldCheck,
  Settings,
  History,
  UserCog,
  Percent,
  Ticket,
  Archive,
  ClipboardList,
  Tv,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navCafe } from "@/config/nav-cafe";
import { getBasePathByRole } from "@/lib/role-path";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import Link from "next/link";

// interface NavItem {
//   title: string;
//   url: string;
//   icon?: LucideIcon;
//   isActive?: boolean;
//   items?: {
//     title: string;
//     url: string;
//   }[];
// }

// Helper function untuk mendapatkan icon
const getIcon = (iconName: string | React.ComponentType<any>) => {
  if (typeof iconName === "string") {
    const iconMap: Record<string, React.ComponentType<any>> = {
      LayoutDashboard,
      ShoppingCart,
      Package,
      BarChart3,
      FolderTree,
      Palette,
      User,
      Users,
      ShieldAlert,
      ShieldCheck,
      Settings,
      History,
      UserCog,
      Percent,
      Ticket,
      Archive,
      ClipboardList,
      Tv,
    };
    return iconMap[iconName] || LayoutDashboard;
  }
  return iconName;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const role = Array.isArray(session.user.roles)
    ? session.user.roles[0]
    : session.user.roles;

  const basePath = getBasePathByRole(role);

  const getFullUrl = (url: string) => {
    if (url === "#") return "#";
    // If it's an absolute path starting with these prefixes, keep it as is
    if (
      url.startsWith('/staff') ||
      url.startsWith('/admin') ||
      url.startsWith('/super-admin') ||
      url.startsWith('/manager') ||
      url.startsWith('/dashboard') ||
      url.startsWith('/layar-tv')
    ) return url;

    // For relative paths, prepend the basePath
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${basePath}${path}`;
  };

  const isActive = (url: string) => {
    const fullUrl = getFullUrl(url);
    return pathname === fullUrl;
  };

  const getNavItems = (): any[] => {
    if (role === "SUPER_ADMIN") {
      return navCafe.superAdmin;
    }
    if (role === "ADMIN") {
      return navCafe.admin;
    }
    if (role === "MANAGER") {
      return navCafe.manager;
    }
    if (role === "STAFF") {
      return navCafe.staff;
    }
    return [];
  };

  const navGroups = getNavItems();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  {/* <GalleryVerticalEnd className="size-4" /> */}
                  <Avatar className="rounded-md">
                    <AvatarImage src="/icons/favicon-for-app/icon0.svg" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                    <AvatarBadge className="bg-green-600 dark:bg-green-800" />
                  </Avatar>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Cafe Management</span>
                  <span className="text-xs text-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <SidebarGroup key={group.title || index} className={index > 0 ? "pt-0" : ""}>
            {group.title && (
              <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.items.map((item: any) => {
                const IconComponent = getIcon(item.icon);
                const isActiveItem = isActive(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActiveItem}
                      tooltip={item.title}
                    >
                      <Link href={getFullUrl(item.url)}>
                        <IconComponent className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
