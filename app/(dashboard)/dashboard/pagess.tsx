"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrders } from "@/lib/order-api";

const defaultStats = {
  products: { total: 0, active: 0, draft: 0, inactive: 0 },
  users: { total: 0, active: 0, newToday: 0, newThisWeek: 0 },
  orders: { ordered: 0, processing: 0, ready: 0 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getOrdersByProductStatus = (orders: any[], status: string) => {
    return orders.map((order: any) => {
      const products = Array.isArray(order?.products) ? order.products : [];
      const filteredProducts = products.filter((p: any) => {
        const itemStatus = p.status || "ORDERED";
        return itemStatus.toUpperCase() === status.toUpperCase();
      });
      if (filteredProducts.length === 0) return null;
      return { ...order, products: filteredProducts };
    }).filter(Boolean);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");

      const dashboardResponse = await fetch("/api/dashboard");
      if (!dashboardResponse.ok) {
        console.error("API response not OK:", dashboardResponse.status);
        throw new Error(`HTTP ${dashboardResponse.status}`);
      }
      const dashboardData = await dashboardResponse.json();
      console.log("Dashboard data received:", dashboardData);

      const ordersResponse = await getOrders();
      const allOrders = ordersResponse?.rows || [];
      console.log("Orders received:", allOrders.length);
      const orderedCount = getOrdersByProductStatus(allOrders, "ORDERED").length;
      const processingCount = getOrdersByProductStatus(allOrders, "PROCESSING").length;
      const readyCount = getOrdersByProductStatus(allOrders, "READY").length;

      setStats({
        products: dashboardData.products || defaultStats.products,
        users: dashboardData.users || defaultStats.users,
        orders: {
          ordered: orderedCount,
          processing: processingCount,
          ready: readyCount,
        },
      });
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
      setStats(defaultStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Dashboard</h1>
            <p className="text-gray-500 text-sm">Memuat data performa...</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const KPICard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    iconColorClass,
    subtitle
  }: any) => (
    <Card className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">
              {title}
            </p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {value}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${colorClass}`}>
            <Icon className={`h-5 w-5 ${iconColorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Statistik dan performa kafe secara real-time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white hover:bg-gray-50 border-gray-200 h-9 font-bold text-xs uppercase tracking-widest"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Memperbarui..." : "Refresh"}
          </Button>
          <Link href="/layar-tv">
            <Button size="sm" className="bg-gray-900 cursor-pointer hover:bg-gray-800 text-white shadow-lg h-9 font-bold text-xs uppercase tracking-widest px-4">
              Layar TV
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI GRID - RESPONSIVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {/* ORDERED */}
        <KPICard
          title="ORDERED"
          value={stats.orders.ordered}
          subtitle="Pesanan baru masuk"
          icon={Package}
          colorClass="bg-blue-100/80"
          iconColorClass="text-blue-600"
        />

        {/* PROCESSING */}
        <KPICard
          title="PROCESSING"
          value={stats.orders.processing}
          subtitle="Sedang diproses"
          icon={RefreshCw}
          colorClass="bg-orange-100/80"
          iconColorClass="text-orange-600"
        />

        {/* READY */}
        <KPICard
          title="READY"
          value={stats.orders.ready}
          subtitle="Siap disajikan"
          icon={TrendingUp}
          colorClass="bg-green-100/80"
          iconColorClass="text-green-600"
        />

        {/* TOTAL PRODUCTS */}
        <KPICard
          title="Total Products"
          value={stats.products.total}
          subtitle={`${stats.products.active} Aktif • ${stats.products.inactive} Nonaktif`}
          icon={Package}
          colorClass="bg-amber-100/80"
          iconColorClass="text-amber-600"
        />

        {/* TOTAL USERS */}
        <KPICard
          title="Total Users"
          value={stats.users.total}
          subtitle={`${stats.users.newToday} Baru hari ini`}
          icon={Users}
          colorClass="bg-purple-100/80"
          iconColorClass="text-purple-600"
        />
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Pintasan Cepat</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/order">
            <Button variant="outline" className="w-full justify-start font-bold text-xs uppercase tracking-wider py-6 bg-white border-dashed border-2 hover:border-gray-900 transition-colors">
              <Package className="mr-2 h-4 w-4" />
              Kelola Pesanan
            </Button>
          </Link>
          <Link href="/product/create">
            <Button variant="outline" className="w-full justify-start font-bold text-xs uppercase tracking-wider py-6 bg-white border-dashed border-2 hover:border-gray-900 transition-colors">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
          <Link href="/users">
            <Button variant="outline" className="w-full justify-start font-bold text-xs uppercase tracking-wider py-6 bg-white border-dashed border-2 hover:border-gray-900 transition-colors">
              <Users className="mr-2 h-4 w-4" />
              Kelola User
            </Button>
          </Link>
          <Link href="/product">
            <Button variant="outline" className="w-full justify-start font-bold text-xs uppercase tracking-wider py-6 bg-white border-dashed border-2 hover:border-gray-900 transition-colors">
              <Package className="mr-2 h-4 w-4" />
              Kelola Produk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
