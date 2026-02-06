"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingCart, Maximize2, Minimize2 } from "lucide-react";

export default function AdminNavbar({
  isFullscreen,
  onToggleFullscreen,
}: {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/admin" className="font-bold text-lg">
          ☕ Cafe POS
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/admin/transactions">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </Link>

          <Button variant="ghost" size="sm" onClick={onToggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Link href="/admin/profile">
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
