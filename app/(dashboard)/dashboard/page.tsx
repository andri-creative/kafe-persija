"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    Search,
    Star,
    ArrowRight
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Hello Orlando, welcome back!</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-[#ff3535] transition-colors" />
                    <input
                        type="search"
                        placeholder="Search anything..."
                        className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 rounded-2xl border-none pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#ff3535]/20 outline-none transition-all font-medium"
                    />
                </div>
            </div>

            {/* Main Layout Grid - Sidebar wraps to bottom on <lg (iPad/Tablet range) */}
            <div className="grid grid-cols-12 gap-8">

                {/* LEFT CONTENT AREA */}
                <div className="col-span-12 lg:col-span-9 flex flex-col gap-8">

                    {/* Stat Cards - 3 Columns on md+ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="border-none shadow-sm bg-orange-50/50 dark:bg-orange-950/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600">
                                        <ShoppingCart className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Orders</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">48,652</span>
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[10px] font-black flex items-center gap-0.5">
                                                <TrendingUp className="h-3 w-3" /> 1.58%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
                                        <Users className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Customer</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">1248</span>
                                            <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none text-[10px] font-black flex items-center gap-0.5">
                                                <TrendingUp className="h-3 w-3" /> 0.43%
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-950/10 rounded-[2rem] overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600">
                                        <DollarSign className="h-7 w-7" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Revenue</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">$215,860</span>
                                            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-[10px] font-black flex items-center gap-0.5">
                                                <TrendingUp className="h-3 w-3" /> 2.36%
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
                        <Card className="col-span-1 md:col-span-2 lg:col-span-8 order-1 border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <CardTitle className="text-xl font-black">Total Revenue</CardTitle>
                                    <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">$184,839</span>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                        <div className="h-2 w-2 rounded-full bg-[#ff3535]" /> Income
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                                        <div className="h-2 w-2 rounded-full bg-zinc-300" /> Expense
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-2">
                                <div className="h-[250px] w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-[2rem] flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold italic">Revenue Waveform Chart Placeholder</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Top Categories Chart */}
                        {/* TABLET: 50% width (ord: 4) | DESKTOP: 4/12 width (ord: 2 - beside revenue) */}
                        <Card className="col-span-1 md:col-span-1 lg:col-span-4 order-4 lg:order-2 border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black tracking-tight">Top Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-2">
                                <div className="h-[250px] lg:h-full w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-[2rem] flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 min-h-[150px]">
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold italic text-center px-4">Donut Chart Placeholder</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Orders Overview Chart */}
                        {/* TABLET: 100% width (ord: 2) | DESKTOP: 8/12 width (ord: 3) */}
                        <Card className="col-span-1 md:col-span-2 lg:col-span-8 order-2 lg:order-3 border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-black tracking-tight">Orders Overview</CardTitle>
                                <select className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-3 py-1 text-[10px] font-black outline-none">
                                    <option>This Week</option>
                                </select>
                            </CardHeader>
                            <CardContent className="p-8 pt-2">
                                <div className="h-[200px] w-full bg-zinc-50 dark:bg-zinc-950/50 rounded-[2rem] flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800">
                                    <span className="text-zinc-300 dark:text-zinc-700 font-bold italic">Bar Chart Placeholder</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Order Types Summary */}
                        {/* TABLET: 50% width (ord: 3) | DESKTOP: 4/12 width (ord: 4 - beside orders) */}
                        <Card className="col-span-1 md:col-span-1 lg:col-span-4 order-3 lg:order-4 border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black tracking-tight">Order Types</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-2 flex flex-col gap-4">
                                {[
                                    { name: "Dine-In", value: "45%", color: "bg-[#ff3535]" },
                                    { name: "Takeaway", value: "30%", color: "bg-orange-300" },
                                    { name: "Online", value: "25%", color: "bg-orange-100" }
                                ].map((type, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`h-1.5 w-1.5 rounded-full ${type.color}`} />
                                                <span className="text-zinc-900 dark:text-zinc-100">{type.name}</span>
                                            </div>
                                            <span className="text-zinc-400">{type.value}</span>
                                        </div>
                                        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${type.color}`} style={{ width: type.value }} />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Orders Table */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
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
                                    {[
                                        { id: "ORD1025", name: "Salmon Sushi Roll", category: "Seafood", qty: 3, amount: "$30.00", status: "On Process", statusColor: "bg-orange-500/10 text-orange-600" },
                                        { id: "ORD1026", name: "Spaghetti Carbonara", category: "Pasta", qty: 1, amount: "$15.00", status: "Cancelled", statusColor: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500" }
                                    ].map((order) => (
                                        <TableRow key={order.id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                                            <TableCell className="font-bold text-xs py-5 text-zinc-500">{order.id}</TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center font-black text-orange-600 text-xs">SR</div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">{order.name}</span>
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{order.category}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-black text-sm text-zinc-900 dark:text-zinc-100 py-5">{order.qty}</TableCell>
                                            <TableCell className="font-black text-sm text-zinc-900 dark:text-zinc-100 py-5">{order.amount}</TableCell>
                                            <TableCell className="py-5">
                                                <Badge className={`border-none ${order.statusColor} px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-wider`}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT SIDEBAR - Wraps below on Tablets (<lg) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">

                    {/* Trending Menus Section */}
                    <Card className="border-none shadow-sm bg-white dark:bg-zinc-900/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black">Trending Menus</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 flex flex-col gap-6">
                            {[
                                { name: "Grilled Chicken Delight", type: "Chicken", price: "$18.00", rating: "4.9", orders: "350", color: "from-orange-100 to-orange-200" },
                                { name: "Sunny Citrus Cake", type: "Dessert", price: "$8.50", rating: "4.8", orders: "400", color: "from-yellow-100 to-yellow-200" }
                            ].map((item, i) => (
                                <div key={i} className="group cursor-pointer">
                                    <div className={`h-40 w-full rounded-[2rem] bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-500 shadow-md`}>
                                        <div className="h-16 w-16 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-zinc-800">
                                            <ShoppingCart className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start mb-2 px-1">
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#ff3535] transition-colors">{item.name}</span>
                                            <span className="text-[10px] font-bold text-zinc-400">{item.type}</span>
                                        </div>
                                        <span className="font-black text-[#ff3535] text-sm">{item.price}</span>
                                    </div>
                                    <div className="flex items-center gap-4 px-1">
                                        <div className="flex items-center gap-1 text-[10px] font-black text-zinc-600">
                                            <Star className="h-3 w-3 text-orange-400 fill-orange-400" /> {item.rating}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-zinc-400">
                                            <Users className="h-3 w-3" /> {item.orders}
                                        </div>
                                    </div>
                                </div>
                            ))}
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