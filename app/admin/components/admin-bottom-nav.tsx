"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingCart,
  UtensilsCrossed,
  BarChart3,
} from "lucide-react";

const currentRole = "admin"; // nanti dari prisma

const menus = [
  {
    label: "Home",
    href: "/admin",
    icon: Home,
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    label: "Orders",
    href: "/admin/transactions",
    icon: ShoppingCart,
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    label: "Menu",
    href: "/admin/products",
    icon: UtensilsCrossed,
    roles: ["super_admin", "admin"],
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    roles: ["super_admin", "admin", "manager"],
  },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t bg-background">
      <div className="grid grid-cols-4">
        {menus
          .filter(m => m.roles.includes(currentRole))
          .map(menu => {
            const Icon = menu.icon;
            const active = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={cn(
                  "flex flex-col items-center py-3 text-xs",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {menu.label}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
