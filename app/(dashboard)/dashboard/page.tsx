'use client'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    Search,
    Star,
    ArrowRight,
    Package
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

export default function DashboardPage() {
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
                setLoading(false);
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

    return (
        <div className="flex flex-col gap-5 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="md:text-2xl text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                </div>
            </div>
            {/* Main Layout Grid - Sidebar wraps to bottom on <lg (iPad/Tablet range) */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT CONTENT AREA */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">

                    {/* Stat Cards - 3 Columns on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-950/10 rounded-base md:rounded-base overflow-hidden">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600">
                                        <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-zinc-400">
                                            Total Orders
                                        </span>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <span className="text-lg md:text-xl lg:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                                                {loading ? "..." : formatNumber(stats?.orders?.total)}
                                            </span>
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[8px] md:text-[10px] font-black flex items-center gap-0.5 px-1.5 py-0.5 md:px-2">
                                                <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> {stats?.orders?.trending || "0"}%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/10 rounded-base md:rounded-base overflow-hidden">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600">
                                        <Package className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-zinc-400">
                                            Total Products
                                        </span>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <span className="text-lg md:text-xl lg:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                                                {loading ? "..." : formatNumber(stats?.products?.total)}
                                            </span>
                                            <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none text-[8px] md:text-[10px] font-black flex items-center gap-0.5 px-1.5 py-0.5 md:px-2">
                                                <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> {stats?.products?.trending || "0"}%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-950/10 rounded-base md:rounded-base overflow-hidden">
                            <CardContent className="p-4 md:p-5">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-600">
                                        <DollarSign className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-zinc-400">
                                            Total Revenue
                                        </span>
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <span className="text-lg md:text-xl lg:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                                                {loading ? "..." : formatCurrency(stats?.orders?.revenue)}
                                            </span>
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[8px] md:text-[10px] font-black flex items-center gap-0.5 px-1.5 py-0.5 md:px-2">
                                                <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> {stats?.orders?.trending || "0"}%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart Distribution Grid - Using Order Classes for Responsive Reordering */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">

                        {/* 1. Total Revenue Chart */}
                        {/* TABLET: 100% width (ord: 1) | DESKTOP: 8/12 width (ord: 1) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-8 order-1">
                            <ChartAreaTotalRevenue data={stats?.charts?.revenue} />
                        </div>

                        {/* 2. Top Categories Chart */}
                        {/* TABLET: 50% width (ord: 4) | DESKTOP: 4/12 width (ord: 2 - beside revenue) */}
                        <div className="col-span-1 md:col-span-1 lg:col-span-4 order-4 lg:order-2">
                            <TopCategoryChart data={stats?.charts?.categories} />
                        </div>

                        {/* 3. Orders Overview Chart */}
                        {/* TABLET: 100% width (ord: 2) | DESKTOP: 8/12 width (ord: 3) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-8 order-2 lg:order-3">
                            <ChartBarOrder data={stats?.charts?.orders} />
                        </div>

                        {/* 4. Order Types Summary */}
                        {/* TABLET: 50% width (ord: 3) | DESKTOP: 4/12 width (ord: 4 - beside orders) */}
                        {/* 4. Recent Orders Today */}
                        <div className="col-span-1 md:col-span-1 lg:col-span-4 order-3 lg:order-4">
                            <ChartPieTopVariant data={stats?.charts?.variants} />
                        </div>
                        {/* <Card className="col-span-1 md:col-span-1 lg:col-span-4 order-3 lg:order-4 border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden h-full flex flex-col">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base font-black tracking-tight">Recent Orders Today</CardTitle>
                                <span className="text-[9px] font-black text-[#ff3535] bg-[#ff3535]/10 px-2 py-0.5 rounded-full">LIVE</span>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[250px] custom-scrollbar">
                                {stats?.recentOrdersToday && stats.recentOrdersToday.length > 0 ? (
                                    stats.recentOrdersToday.map((order: any, i: number) => (
                                        <div key={order.id || i} className="flex flex-col gap-1.5 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                                        {order.order_number}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-zinc-400 capitalize">
                                                        {order.table !== "General" ? `Meja ${order.table}` : "Takeaway"} • {new Date(order.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-100">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(order.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-8">
                                        <div className="text-[10px] font-black uppercase tracking-widest">No Orders Today</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card> */}
                    </div>
                    {/* Recent Orders Table */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden">
                        <CardHeader className="p-8 pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black">Recent Orders</CardTitle>
                            <button className="text-xs font-black text-[#ff3535] hover:opacity-80 flex items-center gap-1 transition-all group">
                                See All Orders <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 h-12">Order ID</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 h-12">Menu</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 h-12">Qty</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 h-12">Amount</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 h-12">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats?.recentItems && stats.recentItems.length > 0 ? (
                                        stats.recentItems.map((item: any, i: number) => (
                                            <TableRow key={item.full_order_id + i} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                                <TableCell className="font-bold text-xs py-5 text-zinc-500">{item.order_id}</TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center font-black text-orange-600 text-xs">
                                                            {item.initials}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">{item.name}</span>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{item.category}</span>
                                                                {item.variant && (
                                                                    <>
                                                                        <span className="text-zinc-300">•</span>
                                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{item.variant}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-black text-sm text-zinc-900 dark:text-zinc-100 py-5">{item.qty}</TableCell>
                                                <TableCell className="font-black text-sm text-zinc-900 dark:text-zinc-100 py-5">
                                                    {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(item.amount)}
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <Badge className={`border-none px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                                        item.status === 'CANCELLED' ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500' :
                                                            'bg-orange-500/10 text-orange-600'
                                                        }`}>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-10 text-center opacity-40 font-black uppercase text-xs tracking-widest">
                                                No recent items today
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SIDEBAR - Wraps below on Tablets (<lg) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">

                    {/* Trending Menus Section */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-base overflow-hidden">
                        <CardHeader className="p-4 pt-0 pb-4">
                            <CardTitle className="text-lg font-black">Trending Menus</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 flex flex-col gap-6">
                            {stats?.trendingMenus && stats.trendingMenus.length > 0 ? (
                                stats.trendingMenus.map((item: any, i: number) => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className={`h-40 w-full rounded-[1.5rem] bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-500 shadow-md relative overflow-hidden`}>
                                            {item.image ? (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `/images/variant/${item.image}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e: any) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="h-16 w-16 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-zinc-800 z-10" style={{ display: item.image ? 'none' : 'flex' }}>
                                                <ShoppingCart className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start mb-2 px-1">
                                            <div className="flex flex-col min-w-0 flex-1 pr-2">
                                                <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#ff3535] transition-colors truncate">{item.name}</span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{item.type}</span>
                                            </div>
                                            <span className="font-black text-[#ff3535] text-sm whitespace-nowrap">{item.price}</span>
                                        </div>
                                        <div className="flex items-center gap-4 px-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400">
                                                <Users className="h-3 w-3" />
                                                <span>{item.orders} <span className="text-[8px] font-bold uppercase ml-0.5">Orders</span></span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center opacity-40 font-black uppercase text-xs tracking-widest">
                                    No trending data
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity Section */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 flex flex-col gap-8">
                            {[
                                { user: "Sylvester", action: "updated inventory", target: "Chicken", initial: "SQ", color: "bg-blue-100 text-blue-600" },
                                { user: "Maria", action: "completed order", target: "#ORD1028", initial: "MK", color: "bg-orange-100 text-orange-600" }
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`h-10 w-10 shrink-0 rounded-xl ${activity.color} flex items-center justify-center font-black text-xs shadow-sm shadow-current/20`}>
                                        {activity.initial}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                                            <span className="font-black text-zinc-900 dark:text-zinc-100">{activity.user}</span> {activity.action} <span className="font-bold text-zinc-800 dark:text-zinc-200">"{activity.target}"</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
