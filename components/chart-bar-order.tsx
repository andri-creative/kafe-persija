"use client"
import { TrendingUp, BarChart3, Calendar } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

// DATA DUMMY DIHAPUS - Murni menggunakan data props
const weekData: any[] = [];

const chartConfigOrder = {
    currentWeek: {
        label: "Minggu Ini",
        color: "#3b82f6", // Blue
    },
    lastWeek: {
        label: "Minggu Lalu",
        color: "#94a3b8", // Gray
    },
} satisfies ChartConfig

export function ChartBarOrder({ data }: { data?: any[] }) {
    // Gunakan data asli dari API
    const displayData = data || [];

    // Check if there is actual data to show
    const hasData = displayData.some(item => (item.currentWeek || 0) > 0 || (item.lastWeek || 0) > 0);

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/70 backdrop-blur-md rounded-xl overflow-hidden w-full h-full flex flex-col min-h-[350px]">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Order Volume</CardTitle>
                        <CardDescription className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase italic">Weekly Monitor</CardDescription>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1 flex flex-col">
                {!hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-10">
                        <Calendar className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No orders this week</p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfigOrder} className="h-[240px] w-full mb-4">
                        <BarChart 
                            data={displayData} 
                            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                            barGap={4}
                        >
                            <CartesianGrid vertical={false} strokeOpacity={0.1} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                fontSize={10}
                                fontWeight="black"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                fontSize={10}
                                fontWeight="bold"
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar 
                                dataKey="lastWeek" 
                                fill="var(--color-lastWeek)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={16} 
                            />
                            <Bar 
                                dataKey="currentWeek" 
                                fill="var(--color-currentWeek)" 
                                radius={[4, 4, 0, 0]} 
                                barSize={16} 
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}