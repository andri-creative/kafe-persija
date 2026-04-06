"use client"
import { Award, Calendar, Package } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
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

const defaultData: any[] = [];

const chartConfig = {
    q: {
        label: "Terjual",
    },
} satisfies ChartConfig

export function ChartPieTopVariant({ data }: { data?: any[] }) {
    const displayData = data && data.length > 0 ? data : defaultData;

    const processedData = displayData.map((item, index) => {
        const rawName = item.variant || item.label || item.browser || item.name || "N/A";
        // Gunakan truncate agar 2 kolom tetap rapi
        return {
            name: rawName,
            q: item.value || item.sold || item.visitors || item.q || 0,
            fill: item.fill || [
                "#f97316", "#10b981", "#3b82f6", "#6366f1", "#f59e0b"
            ][index % 5]
        };
    });

    const total = processedData.reduce((acc, curr) => acc + curr.q, 0);

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/70 backdrop-blur-md rounded-xl overflow-hidden w-full h-full flex flex-col min-h-[350px]">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Inventory Insight</CardTitle>
                        <CardDescription className="text-[11px] font-black text-zinc-900 dark:text-zinc-100 uppercase">Top Variants</CardDescription>
                    </div>
                    <div className="h-8 w-8 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                        <Award className="h-4 w-4" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 px-5 pt-2 flex flex-col items-center justify-center">
                {total === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-10">
                        <Package className="h-10 w-10 text-zinc-200 dark:text-zinc-700 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No sales recorded</p>
                    </div>
                ) : (
                    <>
                        <div className="relative h-[160px] w-full flex items-center justify-center">
                            <ChartContainer
                                config={chartConfig}
                                className="mx-auto aspect-square h-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        content={<ChartTooltipContent nameKey="name" hideLabel />}
                                    />
                                    <Pie
                                        data={processedData}
                                        dataKey="q"
                                        nameKey="name"
                                        innerRadius={0}
                                        outerRadius={60}
                                        strokeWidth={2}
                                        stroke="white"
                                        labelLine={false}
                                        label={({ payload }) => {
                                            const p = total > 0 ? Math.round((payload.q / total) * 100) : 0;
                                            return p > 15 ? `${p}%` : "";
                                        }}
                                    />
                                </PieChart>
                            </ChartContainer>
                        </div>

                        {/* Legend Berjajar Kiri & Kanan (Grid 2 Kolom) */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-4 border-t border-zinc-50 dark:border-zinc-800 pt-4">
                            {processedData.slice(0, 4).map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-[9px] font-black uppercase min-w-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                                        <span className="text-zinc-600 dark:text-zinc-400 truncate">{item.name}</span>
                                    </div>
                                    <span className="text-zinc-950 dark:text-zinc-100 shrink-0">
                                        {total > 0 ? Math.round((item.q / total) * 100) : 0}%
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
