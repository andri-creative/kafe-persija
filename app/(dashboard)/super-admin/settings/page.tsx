"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Globe, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Pengaturan Global</h2>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 transition-all hover:shadow-md border-white/20 bg-black/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Branding & Identitas
                        </CardTitle>
                        <CardDescription>
                            Kelola nama toko, logo, dan identitas visual aplikasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="app-name">Nama Aplikasi</Label>
                            <Input id="app-name" defaultValue="Persija Kafe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="app-logo">URL Logo</Label>
                            <Input id="app-logo" defaultValue="/icons/favicon-for-app/icon0.svg" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="store-address">Alamat Toko</Label>
                            <Input id="store-address" defaultValue="Jakarta, Indonesia" />
                        </div>
                        <Button className="w-full md:w-auto">Simpan Perubahan</Button>
                    </CardContent>
                </Card>
                <Card className="col-span-3 transition-all hover:shadow-md border-white/20 bg-black/5 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            API & Keamanan
                        </CardTitle>
                        <CardDescription>
                            Konfigurasi API Key dan pengaturan keamanan global.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="api-key">Public API Key</Label>
                            <Input id="api-key" type="password" defaultValue="pk_test_xxxxxxxxxxxxxx" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="webhook">Webhook URL</Label>
                            <Input id="webhook" defaultValue="https://callback.persija.id" />
                        </div>
                        <Button variant="outline" className="w-full">Update Keys</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}