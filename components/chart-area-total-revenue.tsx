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

// DATA DUMMY (DATA JUTAAN)
const dummyData = [
    { day: "Senin", currentWeek: 1200000, lastWeek: 900000 },
    { day: "Selasa", currentWeek: 1500000, lastWeek: 1100000 },
    { day: "Rabu", currentWeek: 1400000, lastWeek: 1650000 },
    { day: "Kamis", currentWeek: 1850000, lastWeek: 1300000 },
    { day: "Jumat", currentWeek: 2100000, lastWeek: 1800000 },
    { day: "Sabtu", currentWeek: 3200000, lastWeek: 2400000 },
    { day: "Minggu", currentWeek: 2800000, lastWeek: 2900000 },
]

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
    // Dipaksa menggunakan dummyData jutaan
    const displayData = dummyData;

    // Helper untuk format mata uang ringkas (jt / rb)
    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toLocaleString('id-ID')} Jt`;
        if (value >= 1000) return `${(value / 1000).toLocaleString('id-ID')} Rb`;
        return value.toString();
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden w-full h-full min-h-[350px] flex flex-col">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400">Total Revenue</CardTitle>
                        <CardDescription className="text-xs font-bold text-zinc-900 uppercase">
                            Weekly Comparison Performance
                        </CardDescription>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1">
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
                            tickFormatter={(value) => value.slice(0, 3)}
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
            </CardContent>
        </Card>
    );
}