"use client";

import { Card } from "@/components/ui/card";
import { Navbar } from "./_components/Navbar";

export default function StaffLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col gap-2">
            <div className="max-w-7xl mx-auto w-full px-4 flex flex-col gap-2">
                {/* Sticky Header Area */}
                <header className="sticky top-0 z-50 pt-2 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
                    <Card className="shadow-sm py-3 border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
                        <Navbar />
                    </Card>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full pb-6">
                    <Card className="min-h-[calc(100vh-120px)] shadow-sm border-zinc-200/60 dark:border-zinc-800/60 p-5">
                        {children}
                    </Card>
                </main>
            </div>
        </div>
    );
}
