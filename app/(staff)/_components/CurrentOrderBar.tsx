"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronRight, Maximize2 } from "lucide-react";

interface ActiveOrder {
    id: string;
    customerName: string;
    tableNumber: string;
    itemCount: number;
    totalAmount: number;
    progress: number;
}

const activeOrders: ActiveOrder[] = [
    { id: "ID1902", customerName: "Michael Jordan", tableNumber: "12", itemCount: 12, totalAmount: 290000, progress: 100 },
    { id: "ID8991", customerName: "Sujiwo Bejo", tableNumber: "09", itemCount: 4, totalAmount: 180000, progress: 79 },
    { id: "ID1712", customerName: "Dere Rizkani", tableNumber: "10", itemCount: 6, totalAmount: 190000, progress: 60 },
    { id: "ID8912", customerName: "Filipius Seris", tableNumber: "04", itemCount: 3, totalAmount: 90000, progress: 40 },
];

export function CurrentOrderBar() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    Current order
                </h2>
                <button className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline">
                    View all
                </button>
            </div>

            <div className="flex flex-row overflow-x-auto gap-4 pb-2 no-scrollbar scroll-smooth">
                {activeOrders.map((order) => (
                    <Card
                        key={order.id}
                        className="shrink-0 w-64 p-4 border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 group-hover:text-red-500 transition-colors">
                                    {order.customerName}
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                                    #{order.id} • Table {order.tableNumber}
                                </p>
                            </div>

                            {/* Circular Progress Placeholder */}
                            <div className="relative h-10 w-10 flex items-center justify-center">
                                <svg className="h-full w-full transform -rotate-90">
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="18"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        className="text-zinc-100 dark:text-zinc-800"
                                    />
                                    <circle
                                        cx="20"
                                        cy="20"
                                        r="18"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="transparent"
                                        strokeDasharray={113}
                                        strokeDashoffset={113 - (113 * order.progress) / 100}
                                        className={cn(
                                            "transition-all duration-1000",
                                            order.progress === 100 ? "text-green-500" : "text-[#ff3535]"
                                        )}
                                    />
                                </svg>
                                {order.progress === 100 ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <div className="h-2 w-2 bg-white rounded-full" />
                                        </div>
                                    </div>
                                ) : (
                                    <span className="absolute text-[9px] font-black text-zinc-900 dark:text-zinc-100">
                                        {order.progress}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">
                                {order.itemCount} Items • Rp {order.totalAmount.toLocaleString('id-ID')}
                            </span>
                            <div className="h-6 w-6 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="h-3 w-3 text-zinc-400" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
