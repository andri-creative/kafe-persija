"use client";
import { useSession } from "next-auth/react";
import * as React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  BarChart3,
  FolderTree,
  Palette,
  GalleryVerticalEnd,
  ChevronRight,
  LucideIcon,
  User,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { navCafe } from "@/config/nav-cafe";
import { getBasePathByRole } from "@/lib/role-path";

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
      LayoutDashboard: LayoutDashboard,
      ShoppingCart: ShoppingCart,
      Package: Package,
      BarChart3: BarChart3,
      FolderTree: FolderTree,
      Palette: Palette,
    };
    return iconMap[iconName] || LayoutDashboard;
  }
  return iconName;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [activePath, setActivePath] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []);

  if (!session?.user) return null;

  const role = Array.isArray(session.user.roles)
    ? session.user.roles[0]
    : session.user.roles;

  const basePath = getBasePathByRole(role);

  const isActive = (url: string, items?: Array<{ url: string }>) => {
    if (url === "#" && items) {
      return items.some((item) => activePath === item.url);
    }
    return activePath === url;
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`${basePath}/dashboard`}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
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
        <SidebarGroup>
          <SidebarMenu>
            {navCafe.navMain.map((item) => {
              const IconComponent = getIcon(item.icon);
              const itemIsActive = isActive(item.url, item.items);

              if (item.items && item.items.length > 0) {
                return (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={itemIsActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={itemIsActive}
                        >
                          <IconComponent className="size-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={activePath === subItem.url}
                              >
                                <Link href={`${basePath}${subItem.url}`}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={itemIsActive}
                    tooltip={item.title}
                  >
                    <Link href={`${basePath}${item.url}`}>
                      <IconComponent className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
