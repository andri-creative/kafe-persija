"use client";

import { ReactNode, useState } from "react";
import AdminNavbar from "./admin-navbar";
import AdminBottomNav from "./admin-bottom-nav";

export default function AdminShell({ children }: { children: ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminNavbar
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      {!isFullscreen && <AdminBottomNav />}
    </div>
  );
}
