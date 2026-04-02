'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    Search,
    Star,
    ArrowRight,
    Package,
    Activity,
    Calendar,
    ArrowUpRight,
    Utensils,
    Zap,
    Clock,
    Tag
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import ChartAreaTotalRevenue from "@/components/chart-area-total-revenue";
import { TopCategoryChart } from "@/components/Ppe-chart-donut-topCategory";
import { ChartBarOrder } from "@/components/chart-bar-order";
import { ChartPieTopVariant } from "@/components/chart-pie-top-variant";
import { LogoLoading } from "@/components/logo-loading";
import { ImageHelper } from "@/lib/image-helper";
import Link from "next/link";

export default function DashboardPageV2() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/dashboard/v2/stats");
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat("id-ID").format(num || 0);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const currentHour = new Date().getHours();
    const getGreeting = () => {
        if (currentHour >= 5 && currentHour < 12) return { text: "Good Morning", icon: "☀️" };
        if (currentHour >= 12 && currentHour < 17) return { text: "Good Afternoon", icon: "🌤️" };
        if (currentHour >= 17 && currentHour < 21) return { text: "Good Evening", icon: "🌇" };
        return { text: "Good Night", icon: "🌙" };
    };
    const greeting = getGreeting();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <LogoLoading width={120} height={120} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Loading Summary</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-8 animate-in fade-in duration-700">
            
            {/* ── COMPACT HEADER ── */}
            <div className="relative overflow-hidden rounded-xl bg-indigo-950 px-6 py-6 shadow-xl border border-white/5">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-white/5 blur-2xl rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Weekly Performance (Sen - Min)</p>
                        </div>
                        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white animate-in slide-in-from-left duration-500">
                            {greeting.text}, <span className="text-indigo-200">Persija Admin</span>
                        </h1>
                        <p className="text-indigo-200/50 text-[10px] font-medium max-w-sm italic">
                            Live operational metrics for the current 7-day cycle.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-black/30 backdrop-blur-sm p-1 rounded-xl border border-white/10">
                        <div className="px-4 py-1 text-center border-r border-white/5">
                            <p className="text-[8px] font-black text-indigo-400/70 uppercase tracking-widest leading-none mb-0.5">Revenue</p>
                            <p className="text-base font-black text-white tabular-nums leading-none">
                                {formatCurrency(stats?.revenue)}
                            </p>
                        </div>
                        <div className="px-4 py-1 text-center">
                            <p className="text-[8px] font-black text-indigo-400/70 uppercase tracking-widest leading-none mb-0.5">Orders</p>
                            <p className="text-base font-black text-white tabular-nums leading-none">
                                {formatNumber(stats?.orders)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── COMPACT GRID (9+3) ── */}
            <div className="grid grid-cols-12 gap-5">

                {/* ── LEFT AREA (COL 9) ── */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-5">
                    
                    {/* KPI Cards (More compact p-4) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Order", val: formatNumber(stats?.orders), icon: ShoppingCart, trend: stats?.orderTrend || "0", color: "from-orange-500 to-rose-500" },
                        { label: "Total Revenue", val: formatCurrency(stats?.revenue), icon: DollarSign, trend: stats?.revenueTrend || "0", color: "from-blue-600 to-indigo-600" },
                        { label: "Active Promo", val: formatNumber(stats?.activePromos || 0), icon: Tag, trend: "0", color: "from-emerald-500 to-teal-500" },
                    ].map((kpi, idx) => (
                        <Card key={idx} className="group border-none shadow-sm hover:shadow-md transition-all rounded-xl bg-white/70 backdrop-blur-md">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-11 w-11 shrink-0 bg-linear-to-br ${kpi.color} rounded-lg flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                                        <kpi.icon className="h-5 w-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">{kpi.label}</p>
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-base font-black text-zinc-900 leading-none">{kpi.val}</h3>
                                            <span className={`text-[8px] font-black px-1 rounded-sm leading-none py-0.5 ${Number(kpi.trend) >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                                                {Number(kpi.trend) >= 0 ? '+' : ''}{kpi.trend}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </div>

                    {/* Chart Grid (V1 Style but Compact) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        <div className="col-span-12 lg:col-span-8 min-h-[380px] lg:min-h-[420px]">
                             <ChartAreaTotalRevenue data={stats?.charts?.revenue || []} />
                        </div>
                        <div className="col-span-12 lg:col-span-4 min-h-[380px] lg:min-h-[420px]">
                            <TopCategoryChart data={stats?.charts?.categories || []} />
                        </div>
                        <div className="col-span-12 lg:col-span-8 min-h-[350px]">
                            <ChartBarOrder data={stats?.charts?.orders || []} />
                        </div>
                        <div className="col-span-12 lg:col-span-4 min-h-[350px]">
                            <ChartPieTopVariant data={stats?.charts?.variants || []} />
                        </div>
                    </div>

                    {/* Compact Table */}
                    <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                        <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black tracking-tighter uppercase text-zinc-400">Recent Items Today</CardTitle>
                            <Link href="/product" className="text-[9px] font-black text-indigo-600 hover:opacity-80 transition-opacity">
                                SEE ALL LOGS
                            </Link>
                        </CardHeader>
                        <CardContent className="px-5 pb-4 pt-1">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-50 hover:bg-transparent">
                                        <TableHead className="text-[8px] font-black uppercase text-zinc-400 tracking-widest h-10 w-16">ID</TableHead>
                                        <TableHead className="text-[8px] font-black uppercase text-zinc-400 tracking-widest h-10">Selection</TableHead>
                                        <TableHead className="text-[8px] font-black uppercase text-zinc-400 tracking-widest h-10">Amount</TableHead>
                                        <TableHead className="text-[8px] font-black uppercase text-zinc-400 tracking-widest h-10 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(stats?.recentItems || []).slice(0, 6).map((item: any, i: number) => (
                                        <TableRow key={i} className="group border-b border-zinc-50/50 hover:bg-zinc-50 transition-colors">
                                            <TableCell className="font-bold text-[10px] text-zinc-400 py-3">#{item.order_id}</TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 shrink-0 rounded-lg bg-zinc-50 flex items-center justify-center font-black text-zinc-300 text-[8px] border border-zinc-100 uppercase">
                                                        {item.initials}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-[11px] text-zinc-900 truncate leading-tight">{item.name}</span>
                                                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter truncate">{item.variant || 'Standard'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-[11px] text-zinc-900 py-3 tabular-nums">{formatCurrency(item.amount)}</TableCell>
                                            <TableCell className="py-3 text-right">
                                                <Badge className={`border-none px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                                                    item.status === 'CANCELLED' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* ── RIGHT AREA (COL 3) ── */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
                    
                    {/* Trending (Simplified V1 Style) */}
                    <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase text-zinc-400 flex items-center gap-1.5">
                                <TrendingUp className="h-3 w-3 text-[#ff3535]" /> Trending Menu Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-6">
                            {(() => {
                                const displayMenus = (stats?.trending && stats.trending.length > 0) 
                                    ? stats.trending 
                                    : [];

                                if (displayMenus.length === 0) {
                                    return (
                                        <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                            <Utensils className="h-10 w-10 mb-2" />
                                            <p className="text-[10px] font-black uppercase">No Sales This Week</p>
                                        </div>
                                    );
                                }

                                return displayMenus.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="relative h-40 w-full rounded-[1.5rem] overflow-hidden bg-zinc-100 shadow-md mb-3 border border-zinc-50">
                                            {item.image ? (
                                                <img
                                                    src={ImageHelper.getUrl(item.image, "variant")}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-orange-200 bg-orange-50">
                                                    <ShoppingCart className="h-10 w-10 text-orange-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black text-zinc-900 shadow-sm uppercase tracking-widest flex items-center gap-1.5 border border-zinc-100/50">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                    Trend
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start px-1">
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="font-black text-[13px] text-zinc-900 group-hover:text-[#ff3535] transition-colors truncate leading-tight">{item.name}</span>
                                                <div className="flex items-center gap-1.5 mt-1 text-zinc-400">
                                                    <Users className="h-2.5 w-2.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-tight">{item.sales} Sales</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-black text-[#ff3535] text-[13px] whitespace-nowrap bg-rose-50 px-2 py-1 rounded-lg">
                                                    {item.price ? (item.price > 0 ? (item.price/1000).toFixed(0) + 'k' : formatCurrency(item.price)) : '🔥'}
                                                </span>
                                                <span className="text-[7px] font-black uppercase text-zinc-300 mt-1">{item.type || 'Trending'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </CardContent>
                    </Card>

                    {/* Activity (Compact Sidebar) */}
                    {/* <Card className="border-none shadow-sm rounded-xl bg-zinc-900 overflow-hidden text-white">
                        <CardHeader className="p-5 pb-3">
                            <CardTitle className="text-xs font-black uppercase text-zinc-500 tracking-widest">Feed</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 space-y-5">
                            {[
                                { user: "Sylvester", action: "restock", target: "Meat", initial: "SY", color: "bg-indigo-500" },
                                { user: "Maria", action: "order", target: "Table 04", initial: "MK", color: "bg-rose-500" }
                            ].map((act, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={`h-8 w-8 shrink-0 rounded-lg ${act.color} flex items-center justify-center font-black text-[10px] shadow-lg`}>
                                        {act.initial}
                                    </div>
                                    <div className="space-y-0.5 min-w-0">
                                        <p className="text-[10px] leading-tight text-zinc-400 truncate">
                                            <span className="font-black text-white">{act.user}</span> {act.action} <span className="font-bold text-white">"{act.target}"</span>
                                        </p>
                                        <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Just Now</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card> */}

                </div>
            </div>
            
            {/* ── FOOTER ── */}
            <div className="mt-8 flex items-center justify-center">
                 <div className="h-0.5 w-12 bg-zinc-100 rounded-full" />
            </div>
        </div>
    );
}
