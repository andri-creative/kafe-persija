"use client"
import { TrendingUp, Calendar } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
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
const dummyData: any[] = [];

const chartConfig = {
    currentWeek: {
        label: "Minggu Ini",
        color: "#3b82f6", // Blue
    },
    lastWeek: {
        label: "Minggu Lalu",
        color: "#94a3b8", // Gray
    },
} satisfies ChartConfig

export default function ChartAreaTotalRevenue({ data }: { data?: any[] }) {
    // Gunakan data asli dari API, jika kosong tampilkan []
    const displayData = data || [];

    // Helper untuk format mata uang ringkas (jt / rb)
    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toLocaleString('id-ID')} Jt`;
        if (value >= 1000) return `${(value / 1000).toLocaleString('id-ID')} Rb`;
        return value.toString();
    };

    // Check if there is actual data to show
    const hasData = displayData.some(item => (item.currentWeek || 0) > 0 || (item.lastWeek || 0) > 0);

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/70 backdrop-blur-md rounded-xl overflow-hidden w-full h-full min-h-[350px] flex flex-col">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500">Total Revenue</CardTitle>
                        <CardDescription className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase">
                            Weekly Comparison Performance
                        </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900/30">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1 flex flex-col">
                {!hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-10">
                        <Calendar className="h-12 w-12 text-zinc-200 dark:text-zinc-700 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No revenue data available</p>
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[240px] w-full">
                        <AreaChart
                            data={displayData}
                            margin={{
                                left: -15,
                                right: 0,
                                top: 0,
                                bottom: -10,
                            }}
                        >
                            <defs>
                                <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-currentWeek)" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="var(--color-currentWeek)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="fillLast" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-lastWeek)" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="var(--color-lastWeek)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeOpacity={0.1} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={15}
                                fontSize={10}
                                fontWeight="bold"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                fontSize={9}
                                fontWeight="bold"
                                tickFormatter={formatYAxis}
                            />
                            <ChartTooltip
                                cursor={{ strokeDasharray: '4 4' }}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Area
                                dataKey="lastWeek"
                                type="monotone"
                                fill="url(#fillLast)"
                                stroke="var(--color-lastWeek)"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                            />
                            <Area
                                dataKey="currentWeek"
                                type="monotone"
                                fill="url(#fillCurrent)"
                                stroke="var(--color-currentWeek)"
                                strokeWidth={3}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}