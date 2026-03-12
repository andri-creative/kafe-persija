"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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
    // ChartLegend,
    // ChartLegendContent,
} from "@/components/ui/chart"

export const description = "A pie chart with a custom label"

const defaultChartConfig = {
    visitors: {
        label: "Qty Sold",
    },
    chrome: {
        label: "Chrome",
        color: "var(--chart-1)",
    },
    safari: {
        label: "Safari",
        color: "var(--chart-2)",
    },
    firefox: {
        label: "Firefox",
        color: "var(--chart-3)",
    },
    edge: {
        label: "Edge",
        color: "var(--chart-4)",
    },
    other: {
        label: "Other",
        color: "var(--chart-5)",
    },
} satisfies ChartConfig

interface ChartPieTopVariantProps {
    data?: any[];
}

export function ChartPieTopVariant({ data }: ChartPieTopVariantProps) {
    // Generate dynamic config from data labels
    const dynamicConfig: any = {
        visitors: { label: "Qty Sold" }
    };

    if (data && data.length > 0) {
        data.forEach((item, index) => {
            dynamicConfig[item.browser] = {
                label: item.label || item.browser.charAt(0).toUpperCase() + item.browser.slice(1).replace(/_/g, " "),
                color: `var(--chart-${index + 1})`
            };
        });
    }

    const config = data && data.length > 0 ? dynamicConfig : defaultChartConfig;
    const chartContent = data && data.length > 0 ? data : [
        { browser: "no_data", visitors: 1, fill: "var(--zinc-100)" }
    ];

    return (
        <Card className="flex flex-col shadow-none bg-transparent">
            <CardHeader className="items-start pb-0 p-4">
                <CardTitle className="text-base font-black tracking-tight">Top Variant</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={config}
                    className="mx-auto aspect-square max-h-[200px] px-0"
                >
                    <PieChart>
                        <ChartTooltip
                            content={<ChartTooltipContent nameKey="visitors" hideLabel />}
                        />
                        <Pie
                            data={chartContent}
                            dataKey="visitors"
                            labelLine={false}
                            label={({ payload, ...props }) => {
                                return (
                                    <text
                                        cx={props.cx}
                                        cy={props.cy}
                                        x={props.x}
                                        y={props.y}
                                        textAnchor={props.textAnchor}
                                        dominantBaseline={props.dominantBaseline}
                                        fill="white"
                                        className="text-[10px] font-black"
                                    >
                                        {payload.visitors > 0 ? `${payload.visitors}` : ''}
                                    </text>
                                )
                            }}
                            nameKey="browser"
                            strokeWidth={1}
                        />
                        {/* <ChartLegend
                            content={<ChartLegendContent nameKey="browser" />}
                            className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                        /> */}
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
