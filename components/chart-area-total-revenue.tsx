"use client"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
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

const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Income",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Projection",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export default function ChartAreaTotalRevenue({ data }: { data?: any[] }) {
    const displayData = data && data.length > 0 ? data : chartData;
    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden w-full h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Total Revenue</CardTitle>
                <CardDescription className="text-xs">
                    Last 6 months performance
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                    <AreaChart
                        accessibilityLayer
                        data={displayData}
                        margin={{
                            left: 8,
                            right: 8,
                            top: 5,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={6}
                            tickFormatter={(value) => value.slice(0, 3)}
                            fontSize={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Area
                            dataKey="mobile"
                            type="natural"
                            fill="var(--color-mobile)"
                            fillOpacity={0.4}
                            stroke="var(--color-mobile)"
                            stackId="a"
                            strokeWidth={1.5}
                        />
                        <Area
                            dataKey="desktop"
                            type="natural"
                            fill="var(--color-desktop)"
                            fillOpacity={0.4}
                            stroke="var(--color-desktop)"
                            stackId="a"
                            strokeWidth={1.5}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}