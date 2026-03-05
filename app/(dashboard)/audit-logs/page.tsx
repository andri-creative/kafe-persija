"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { History, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
    const logs = [
        { id: 1, user: "Super Admin", action: "Update Global Settings", target: "Branding", time: "2 menit yang lalu", status: "success" },
        { id: 2, user: "Admin", action: "Delete Product", target: "Espresso", time: "15 menit yang lalu", status: "success" },
        { id: 3, user: "Manager", action: "Export Sales Report", target: "Februari 2026", time: "1 jam yang lalu", status: "success" },
        { id: 4, user: "Admin", action: "Create Discount", target: "Promo Weekend", time: "3 jam yang lalu", status: "failed" },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
            </div>
            <Separator />

        </div>
    );
}