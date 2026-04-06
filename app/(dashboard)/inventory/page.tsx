"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Archive, ArrowUpRight, ArrowDownLeft, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function InventoryPage() {
    const stocks = [
        { id: 1, item: "Biji Kopi Arabica", change: "+10kg", action: "Masuk", date: "Hari ini, 09:00", status: "safe" },
        { id: 2, item: "Susu UHT", change: "-5 Liter", action: "Keluar", date: "Hari ini, 10:30", status: "warning" },
        { id: 3, item: "Gula Aren", change: "+5kg", action: "Masuk", date: "Kemarin, 14:00", status: "safe" },
        { id: 4, item: "Paper Cup 12oz", change: "50 pcs", action: "Stok Rendah", date: "Update: 1 jam lalu", status: "danger" },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Inventaris</h2>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/20 bg-black/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Item Stok Rendah</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Segera lakukan restock</p>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}