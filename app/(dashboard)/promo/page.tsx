"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, Timer, Megaphone, Image as ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function PromoPage() {
    const promos = [
        { id: 1, name: "Diskon Akhir Tahun", code: "YEAREND2026", type: "Voucher", status: "active" },
        { id: 2, name: "Banner Menu Baru", code: "-", type: "Banner", status: "active" },
        { id: 3, name: "Flash Sale Kopi", code: "FLASHCOFFEE", type: "Promo", status: "expired" },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Promo & Banner</h2>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tambah Promo
                </Button>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-white/20 bg-black/5 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promo Aktif</CardTitle>
                        <Megaphone className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-muted-foreground">Berjalan saat ini</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {promos.map((promo) => (
                    <Card key={promo.id} className="transition-all hover:shadow-md border-white/20 bg-black/5 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{promo.name}</CardTitle>
                            {promo.type === "Banner" ? <ImageIcon className="h-4 w-4 text-muted-foreground" /> : <Ticket className="h-4 w-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-1">
                                <div className="text-xs font-mono bg-white/50 p-1 rounded inline-block w-fit">
                                    Code: {promo.code}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">
                                    Tipe: {promo.type}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <Badge variant={promo.status === "active" ? "default" : "secondary"}>
                                    {promo.status === "active" ? "Aktif" : "Selesai"}
                                </Badge>
                                <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
