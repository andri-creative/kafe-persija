"use client"

import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import { Utensils, ChevronDown } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const defaultChartData: any[] = [];

const chartConfig = {
    sold: {
        label: "Terjual",
    },
} satisfies ChartConfig

export function TopCategoryChart({ data }: { data?: any[] }) {
    const displayData = data && data.length > 0 ? data : defaultChartData;

    const processedData = displayData.map((item, index) => ({
        label: item.label || item.category || "Unknown",
        sold: item.value || item.sold || item.visitors || 0,
        fill: item.fill || [
            "#f97316", // Main Orange
            "#10b981", // Emerald
            "#f59e0b", // Amber
            "#0e7490", // Cyan/Dark
            "#8b5cf6", // Violet
        ][index % 5]
    }));

    const totalSold = processedData.reduce((acc, curr) => acc + (curr.sold || 0), 0);

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/70 backdrop-blur-md rounded-xl overflow-hidden w-full h-full flex flex-col min-h-[380px]">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Popular Categories</CardTitle>
                        <CardDescription className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase">Last 7 Days Sales</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-5 pt-0 flex flex-col justify-center">
                {totalSold === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-10">
                        <Utensils className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No sales this week</p>
                    </div>
                ) : (
                    <>
                        <div className="relative h-[180px] w-full flex items-center justify-center">
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square h-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Pie
                                        data={processedData}
                                        dataKey="sold"
                                        nameKey="label"
                                        innerRadius={45}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        strokeWidth={2}
                                        stroke="white"
                                    >
                                        {processedData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                            
                            {/* Inner Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase leading-none mb-1">Total</span>
                                <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 leading-none">{totalSold}</span>
                            </div>
                        </div>

                        {/* Compact Legend */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 border-t border-zinc-50 dark:border-zinc-800 pt-4">
                            {processedData.slice(0, 4).map((item) => (
                                <div key={item.label} className="flex items-center justify-between min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div
                                            className="h-2 w-2 rounded-full shrink-0"
                                            style={{ backgroundColor: item.fill }}
                                        />
                                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 truncate">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-black text-zinc-950 dark:text-zinc-100 shrink-0 ml-1">
                                        {totalSold > 0 ? Math.round((item.sold / totalSold) * 100) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}