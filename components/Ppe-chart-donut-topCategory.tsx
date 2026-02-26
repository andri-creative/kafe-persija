"use client"

import { Pie, PieChart, Cell } from "recharts"
import { ChevronDown } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

const defaultChartData = [
    { label: "Seafood", visitors: 300, fill: "#f97316", browser: "seafood" },
    { label: "Beverages", visitors: 250, fill: "#ffedd5", browser: "beverages" },
    { label: "Dessert", visitors: 250, fill: "#27272a", browser: "dessert" },
    { label: "Pasta", visitors: 200, fill: "#e4e4e7", browser: "pasta" },
]

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
} satisfies ChartConfig

export function TopCategoryChart({ data }: { data?: any[] }) {
    const displayData = data && data.length > 0 ? data : defaultChartData;

    // Standardize data from API if needed
    const processedData = displayData.map((item, index) => ({
        ...item,
        fill: item.fill || [
            "#f97316",
            "#27272a", // Dark
            "#ffedd5", // Peach
            "#e4e4e7", // Grey
            "#fdba74", // Light Orange
        ][index % 5]
    }));

    const totalVisitors = processedData.reduce((acc, curr) => acc + (curr.visitors || 0), 0);

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden w-full h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-base font-black tracking-tight">Top Categories</CardTitle>
                <div className="flex items-center gap-1 text-[9px] font-black text-zinc-400 cursor-pointer">
                    This Month <ChevronDown className="h-2.5 w-2.5" />
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-0">
                <div className="relative h-[140px] w-full">
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
                                dataKey="visitors"
                                nameKey="label"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {processedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>

                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-2 mt-2">
                    {processedData.map((item) => (
                        <div key={item.label} className="flex items-center justify-between min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                    className="h-1.5 w-1.5 rounded-[1px] shrink-0"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span className="text-[9px] font-black text-zinc-800 dark:text-zinc-200 truncate">
                                    {item.label}
                                </span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 shrink-0 ml-1">
                                {totalVisitors > 0 ? Math.round((item.visitors / totalVisitors) * 100) : 0}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}