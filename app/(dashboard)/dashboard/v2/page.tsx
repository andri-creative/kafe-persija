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
    Clock
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
                const response = await fetch("/api/dashboard");
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setTimeout(() => setLoading(false), 800);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-700">
                <LogoLoading width={180} height={180} />
                <div className="flex flex-col items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse">
                        Synchronizing real-time data
                    </p>
                    <div className="h-1 w-48 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* ── MINIMALIST HIGH-FIDELITY HEADER ── */}
            <div className="relative overflow-hidden rounded-xl bg-indigo-900 px-6 py-8 shadow-lg shadow-indigo-100/50">
                {/* Subtle Background Decors */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 bg-white/5 blur-2xl rounded-full" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <span className="text-xs">{greeting.icon}</span>
                             <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/80">Operational Snapshot</p>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
                            {greeting.text}, <span className="text-indigo-200">Persija Admin</span>
                        </h1>
                        <p className="text-indigo-200/50 text-[11px] font-medium max-w-sm">
                            Your stadium operations metrics are calculated for the current weekly cycle.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/5">
                        <div className="px-4 py-1.5 text-center border-r border-white/10">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Weekly Sales</p>
                            <p className="text-lg font-black text-white leading-none tabular-nums truncate max-w-[120px]">
                                {formatCurrency(stats?.orders?.revenue)}
                            </p>
                        </div>
                        <div className="px-4 py-1.5 text-center">
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">7Day Orders</p>
                            <p className="text-lg font-black text-white leading-none tabular-nums">
                                {formatNumber(stats?.orders?.total)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KEY PERFORMANCE INDICATORS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Revenue", val: formatCurrency(stats?.orders?.revenue), icon: DollarSign, trend: stats?.orders?.trending, color: "from-blue-600 to-indigo-600", bg: "bg-blue-50/50" },
                    { label: "Total Orders", val: formatNumber(stats?.orders?.total), icon: ShoppingCart, trend: stats?.orders?.trending, color: "from-orange-500 to-rose-500", bg: "bg-orange-50/50" },
                    { label: "Active Users", val: formatNumber(stats?.customers?.active || 482), icon: Users, trend: "+12", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50/50" },
                    { label: "Avg Ticket", val: formatCurrency(stats?.orders?.avgValue || 45000), icon: Zap, trend: "+4.2", color: "from-purple-500 to-pink-500", bg: "bg-purple-50/50" },
                ].map((kpi, idx) => (
                    <Card key={idx} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-5 p-6">
                                <div className={`h-14 w-14 shrink-0 bg-linear-to-br ${kpi.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <kpi.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{kpi.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">{kpi.val}</h3>
                                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5">
                                            <ArrowUpRight className="h-3 w-3" /> {kpi.trend}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className={`h-1 w-full bg-linear-to-r ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── MAIN CONTENT GRID ── */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* ── LEFT SECTION: DATA VISUALS ── */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    
                    {/* Revenue Deep Dive */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black tracking-tighter">Revenue Distribution</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Earnings across timeline</CardDescription>
                                </div>
                                <div className="flex gap-2 bg-zinc-50 p-1 rounded-xl">
                                    {['7D', '1M', '3M'].map(t => (
                                        <button key={t} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${t === '1M' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>{t}</button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <ChartAreaTotalRevenue data={stats?.charts?.revenue} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <ChartBarOrder data={stats?.charts?.orders} />
                         <ChartPieTopVariant data={stats?.charts?.variants} />
                    </div>

                    {/* Transaction History */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black tracking-tighter">Operational Feed</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Real-time item status</CardDescription>
                            </div>
                            <Link href="/product" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                                VIEW LOGS
                            </Link>
                        </CardHeader>
                        <CardContent className="px-8 pb-8 pt-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-50 hover:bg-transparent">
                                        <TableHead className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] h-14">Order</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] h-14">Selection</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] h-14">Amount</TableHead>
                                        <TableHead className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em] h-14 text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(stats?.recentItems || []).slice(0, 5).map((item: any, i: number) => (
                                        <TableRow key={i} className="group border-b border-zinc-50/50 hover:bg-zinc-50/80 transition-colors">
                                            <TableCell className="font-bold text-[11px] text-zinc-500 py-4 tabular-nums">#{item.order_id}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-50 flex items-center justify-center font-black text-zinc-400 text-[10px] border border-zinc-100 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                                                        {item.initials}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-xs text-zinc-900 truncate">{item.name}</span>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter truncate">{item.variant || 'Standard'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-xs text-zinc-900 py-4 tabular-nums">{formatCurrency(item.amount)}</TableCell>
                                            <TableCell className="py-4 text-right">
                                                <Badge className={`border-none px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
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

                {/* ── RIGHT PART: INSIGHTS & TRENDS ── */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                    
                    {/* Category Distribution */}
                    <div className="animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
                        <TopCategoryChart data={stats?.charts?.categories} />
                    </div>

                    {/* Trending Showcase */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white overflow-hidden">
                        <CardHeader className="p-8 pb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-[#ff3535]" />
                                <CardTitle className="text-lg font-black tracking-tighter">Hot Pick Today</CardTitle>
                            </div>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Most engagement items</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-6">
                            {(stats?.trendingMenus || []).slice(0, 2).map((item: any, i: number) => (
                                <div key={i} className="group relative rounded-[2rem] overflow-hidden border border-zinc-50 shadow-inner bg-zinc-50/30 p-2 hover:bg-white transition-all duration-500">
                                    <div className="relative h-44 w-full rounded-[1.5rem] overflow-hidden bg-zinc-200">
                                        <div className="absolute top-3 left-3 z-20">
                                            <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none font-black text-[9px] px-2 shadow-sm italic">BEST SELLER</Badge>
                                        </div>
                                        {item.image && (
                                            <img
                                                src={ImageHelper.getUrl(item.image, "variant")}
                                                alt={item.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                onError={(e: any) => e.target.style.display = 'none'}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                                            <p className="text-white font-black text-lg line-clamp-1">{item.name}</p>
                                            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-2">
                                             <div className="flex -space-x-2">
                                                 {[1,2,3].map(a => <div key={a} className="h-6 w-6 rounded-full border-2 border-white bg-zinc-200" />)}
                                             </div>
                                             <span className="text-[10px] font-black text-zinc-500">+{item.orders} Sold</span>
                                        </div>
                                        <p className="font-black text-indigo-600">{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Operational Status */}
                    <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-600 overflow-hidden text-white">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-black tracking-tighter italic">Live Feed</CardTitle>
                                <Activity className="h-4 w-4 animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { user: "Sylvester", action: "updated items", target: "Inventory", initial: "SY", icon: Clock },
                                { user: "Maria", action: "ready to serve", target: "Table 04", initial: "MK", icon: Utensils }
                            ].map((act, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                                        {act.initial}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] leading-relaxed text-indigo-100">
                                            <span className="font-black text-white">{act.user}</span> {act.action}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <act.icon className="h-3 w-3 text-indigo-300" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-200">{act.target}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <div className="px-8 py-4 bg-indigo-700/50 backdrop-blur-md flex items-center justify-center">
                             <button className="text-[10px] font-black uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">View All Activity</button>
                        </div>
                    </Card>
                </div>
            </div>
            
            {/* ── FOOTER DECOR ── */}
            <div className="mt-8 flex items-center justify-center">
                 <div className="h-1 w-24 bg-zinc-100 rounded-full" />
            </div>
        </div>
    );
}
