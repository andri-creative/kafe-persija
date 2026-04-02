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

// DATA DUMMY DENGAN LOGIKA REAL-TIME (ASUMSI HARI INI KAMIS)
const weekData = [
    { day: "Senin", currentWeek: 42, lastWeek: 38 },
    { day: "Selasa", currentWeek: 55, lastWeek: 45 },
    { day: "Rabu", currentWeek: 48, lastWeek: 52 },
    { day: "Kamis", currentWeek: 64, lastWeek: 49 },
    { day: "Jumat", currentWeek: 0, lastWeek: 65 },  // Belum ada data (Asumsi hari Kamis)
    { day: "Sabtu", currentWeek: 0, lastWeek: 92 },  // Belum ada data
    { day: "Minggu", currentWeek: 0, lastWeek: 88 }, // Belum ada data
]

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
    // Gunakan weekData dummy agar visual sesuai permintaan real-time
    const displayData = weekData;

    return (
        <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden w-full h-full flex flex-col min-h-[350px]">
            <CardHeader className="">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Volume</CardTitle>
                        <CardDescription className="text-[11px] font-black text-zinc-900 uppercase italic">Weekly Monitor</CardDescription>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1">
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
                            tickFormatter={(value) => value.slice(0, 3)}
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
            </CardContent>
        </Card>
    )
}