"use client";

import { OrderCard } from "./OrderCard";

interface StatusColumnProps {
    title: string;
    count: number;
    orders: any[];
    bgColor: string;
    headerBgColor: string;
    textColor: string;
    rightAction?: React.ReactNode;
    formatJam: (iso?: string) => string;
    getTotalItems: (order: any) => number;
    onOrderClick: (order: any) => void;
}

export function StatusColumn({
    title,
    count,
    orders,
    bgColor,
    headerBgColor,
    textColor,
    rightAction,
    formatJam,
    getTotalItems,
    onOrderClick
}: StatusColumnProps) {
    return (
        <div className={`flex flex-col h-full ${bgColor} border-r border-gray-100 last:border-r-0 min-w-[200px] flex-1`}>
            {/* Column Header */}
            <div className={`${headerBgColor} p-1.5 text-center shadow-sm z-10 sticky top-0 flex items-center justify-center`}>
                <div className="flex-1">
                    <h2 className="text-[9px] font-black text-white uppercase tracking-widest">{title}</h2>
                    <div className="text-white/90 text-[10px] font-black leading-none mt-0.5">
                        {count}
                    </div>
                </div>
                {rightAction && (
                    <div className="absolute right-1">
                        {rightAction}
                    </div>
                )}
            </div>

            {/* Orders List */}
            <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar">
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center h-16 text-gray-400 opacity-30 italic text-[9px]">
                        Empty
                    </div>
                ) : (
                    orders.map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            textColor={textColor}
                            onClick={onOrderClick}
                            formatJam={formatJam}
                            getTotalItems={getTotalItems}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
