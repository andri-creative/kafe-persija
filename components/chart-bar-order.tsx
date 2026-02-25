"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartData = [
    { month: "January", desktop: 186 },
    { month: "February", desktop: 305 },
    { month: "March", desktop: 237 },
    { month: "April", desktop: 73 },
    { month: "May", desktop: 209 },
    { month: "June", desktop: 214 },
]

const chartConfig = {
    desktop: {
        label: "Orders",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ChartBarOrder({ data }: { data?: any[] }) {
    const displayData = data && data.length > 0 ? data : chartData;
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden w-full h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Orders Overview</CardTitle>
                <CardDescription className="text-xs">Monthly totals</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <BarChart accessibilityLayer data={displayData} margin={{ top: 5, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={6}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                            fontSize={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={6} barSize={24} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}