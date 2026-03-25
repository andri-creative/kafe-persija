"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ClipboardList,
    Utensils,
    Tv,
    LogOut,
    User,
    Layers
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { navStaff } from "@/config/nav-staff";
import Image from "next/image";

// Helper function untuk mendapatkan icon
const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
        ClipboardList: ClipboardList,
        Utensils: Utensils,
        Tv: Tv,
        Layers: Layers,
    };
    return iconMap[iconName] || ClipboardList;
};

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto w-full px-4 h-10 md:h-10 flex items-center justify-between relative">
                {/* Left Logo Section - Scaled down for h-11 */}
                <div className="flex items-center">
                    <Link href="/staff/staff" className="flex items-center gap-1.5 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                        <Image
                            src="/icons/favicon-for-app/icon0.svg"
                            alt="Logo"
                            width={30}
                            height={30}
                            className="drop-shadow-sm"
                        />
                    </Link>
                </div>

                {/* Center Navigation - Ultra Compact Capsule */}
                <div className="hidden md:flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-full px-1 py-0.5 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    {navStaff.navMain.map((item) => {
                        const Icon = getIcon(item.icon);
                        const isActive = pathname === item.url || (item.url !== "/staff/staff" && pathname.startsWith(item.url));

                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 text-[12px] font-bold rounded-full transition-all duration-300",
                                    isActive
                                        ? "bg-[#ff3535] text-white shadow-[0_2px_8px_-1px_rgba(255,53,53,0.3)]"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                )}
                            >
                                <Icon className={cn("h-[14px] w-[14px]", isActive ? "text-white" : "text-zinc-400")} />
                                <span className="whitespace-nowrap">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Navigation Icons */}
                <div className="md:hidden flex items-center bg-zinc-50 dark:bg-zinc-800/50 rounded-full px-1 py-0.5 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
                    {navStaff.navMain.map((item) => {
                        const Icon = getIcon(item.icon);
                        const isActive = pathname === item.url;
                        return (
                            <Link
                                key={item.url}
                                href={item.url}
                                className={cn(
                                    "p-1 rounded-full",
                                    isActive ? "bg-[#ff3535] text-white" : "text-zinc-500"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </Link>
                        );
                    })}
                </div>

                {/* Right Action Group - Compact */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col items-end mr-1">
                        <span className="text-[10px] font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {session?.user?.nickname || "Staff"}
                        </span>
                        <span className="text-[8px] text-[#ff3535] font-black uppercase tracking-tighter">
                            {session?.user?.roles?.includes("ADMIN") ? "Admin Account" : "Staff Account"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {(session?.user?.roles?.includes("ADMIN") || session?.user?.roles?.includes("SUPER_ADMIN") || session?.user?.roles?.includes("MANAGER")) && (
                            <Link
                                href="/dashboard"
                                className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-blue-500 dark:text-blue-400 border border-zinc-200/50 dark:border-zinc-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm group"
                                title="Ke Admin Panel"
                            >
                                <Layers className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            </Link>
                        )}

                        <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 overflow-hidden shadow-inner">
                            {session?.user?.picture ? (
                                <img src={session.user.picture} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-3.5 w-3.5" />
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full text-zinc-400 hover:text-red-600 hover:bg-white dark:hover:bg-zinc-800 transition-all"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            <LogOut className="h-3.5 w-3.5 text-zinc-500" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}