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

const defaultStats = {
  products: { total: 0, active: 0, draft: 0, inactive: 0 },
  users: { total: 0, active: 0, newToday: 0, newThisWeek: 0 },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Fetching dashboard data...");

      const response = await fetch("/api/dashboard");

      if (!response.ok) {
        console.error("API response not OK:", response.status);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Dashboard data received:", data);

      if (data && data.products && data.users) {
        setStats(data);
      } else {
        console.warn("Invalid data structure, using defaults");
        setStats(defaultStats);
      }
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
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-500">Memuat data...</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Total: {stats.products.total} produk • {stats.users.total} pengguna
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/layar-tv">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Layar TV
            </Button>
          </Link>
          <Link href="/admin/product/create">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRODUK STATS */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Produk</h2>
                  <p className="text-sm text-gray-500">
                    Total: {stats.products.total} produk
                  </p>
                </div>
              </div>
              <Link
                href="/admin/product"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat semua →
              </Link>
            </div>

            <div className="space-y-4">
              {/* Total Products */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Total Produk</span>
                </div>
                <div className="text-xl font-bold">{stats.products.total}</div>
              </div>

              {/* Active Products */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium">Aktif</span>
                    <div className="text-xs text-gray-500">
                      Tersedia untuk dijual
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {stats.products.active}
                </div>
              </div>

              {/* Draft Products */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <span className="font-medium">Draft</span>
                    <div className="text-xs text-gray-500">
                      Dalam pengerjaan
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-yellow-600">
                  {stats.products.draft}
                </div>
              </div>

              {/* Inactive Products */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-medium">Nonaktif</span>
                    <div className="text-xs text-gray-500">Tidak tersedia</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-red-600">
                  {stats.products.inactive}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* USER STATS */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Pengguna</h2>
                  <p className="text-sm text-gray-500">
                    Total: {stats.users.total} pengguna
                  </p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Lihat semua →
              </Link>
            </div>

            <div className="space-y-4">
              {/* Total Users */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="font-medium">Total Pengguna</span>
                </div>
                <div className="text-xl font-bold">{stats.users.total}</div>
              </div>

              {/* Active Users */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium">Aktif</span>
                    <div className="text-xs text-gray-500">Pengguna aktif</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-green-600">
                  {stats.users.active}
                </div>
              </div>

              {/* New Today */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-medium">Baru Hari Ini</span>
                    <div className="text-xs text-gray-500">
                      Registrasi hari ini
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-blue-600">
                  {stats.users.newToday}
                </div>
              </div>

              {/* New This Week */}
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-medium">Baru Minggu Ini</span>
                    <div className="text-xs text-gray-500">
                      Registrasi minggu ini
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-600">
                  {stats.users.newThisWeek}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/product">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Kelola Produk</div>
                <div className="text-sm text-gray-500">
                  Lihat dan edit semua produk
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/product/category">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Kelola Kategori</div>
                <div className="text-sm text-gray-500">
                  Tambah/edit kategori produk
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Kelola Pengguna</div>
                <div className="text-sm text-gray-500">
                  Lihat dan kelola pengguna
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
