"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Calendar, Filter, FileBarChart, PieChart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SalesReportsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Laporan Penjualan</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Rentang Waktu
                    </Button>
                    <Button className="flex items-center gap-2">
                        <Download className="h-4 w-4" /> Export Data
                    </Button>
                </div>
            </div>
            <Separator />

        </div>
    );
}