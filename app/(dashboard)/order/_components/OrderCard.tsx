"use client";

import { Card, CardContent } from "@/components/ui/card";

interface OrderCardProps {
    order: any;
    textColor: string;
    onClick: (order: any) => void;
    formatJam: (iso?: string) => string;
    getTotalItems: (order: any) => number;
}

export function OrderCard({ order, textColor, onClick, formatJam, getTotalItems }: OrderCardProps) {
    return (
        <Card
            className="border-l-2 overflow-hidden shadow-none border-gray-50 hover:border-blue-200 hover:bg-blue-50/10 transition-all cursor-pointer"
            style={{ borderLeftColor: textColor }}
            onClick={(e) => {
                e.stopPropagation();
                onClick(order);
            }}
        >
            <CardContent className="p-1.5 pointer-events-none">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-1.5 leading-tight">
                    <div className="min-w-0 flex-1">
                        <div className="text-[7px] text-gray-500 font-black uppercase tracking-wider mb-0.5">
                            {order.table?.[0]?.no_table ? `Meja ${order.table[0].no_table}` : "Tanpa Meja"}
                        </div>
                        <div className="font-black text-[10px] text-gray-900 truncate tracking-tight uppercase">{order.order_number}</div>
                    </div>
                    <div className="text-[7px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-black uppercase whitespace-nowrap border border-gray-200/50">
                        {order.status}
                    </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-gray-100">
                    <div className="min-w-0">
                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Payment</div>
                        <div className={`text-[8px] font-black truncate uppercase ${order.payment?.status === 'PAID' ? 'text-green-600' : 'text-amber-600'}`}>
                            {order.payment?.status || "-"}
                        </div>
                    </div>
                    <div className="min-w-0 text-center">
                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Items</div>
                        <div className="text-[8px] font-black text-gray-900 leading-none">
                            {getTotalItems(order)}
                        </div>
                    </div>
                    <div className="min-w-0 text-right">
                        <div className="text-[6px] text-gray-400 font-black uppercase tracking-tighter mb-0.5">Time</div>
                        <div className="text-[8px] text-gray-500 font-bold leading-none">
                            {formatJam(order.created_at)}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
