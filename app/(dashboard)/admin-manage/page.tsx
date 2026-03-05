"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserCog, Mail, Shield, Trash2, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminManagePage() {
    const admins = [
        { id: 1, name: "Ahmad", email: "ahmad@persija.id", role: "SUPER_ADMIN", status: "active" },
        { id: 2, name: "Budi", email: "budi@persija.id", role: "ADMIN", status: "active" },
        { id: 3, name: "Citra", email: "citra@persija.id", role: "MANAGER", status: "active" },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Admin & Manager</h2>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Akun
                </Button>
            </div>
            <Separator />

        </div>
    );
}