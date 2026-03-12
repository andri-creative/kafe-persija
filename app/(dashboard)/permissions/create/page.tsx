"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";

export default function PermissionCreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Nama izin wajib diisi");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/permissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal membuat izin");
            }

            toast.success("Izin berhasil dibuat");
            router.push("/permissions");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <ButtonsComponentsBack backUrl="/permissions" title="Permission" showText />
            </div>

            <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-500" />
                        Detail Izin
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama Izin</label>
                            <Input
                                placeholder="contoh: product_view"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="bg-white/50 dark:bg-zinc-900/50"
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Gunakan format snake_case untuk konsistensi (misal: order_manage).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Deskripsi</label>
                            <Textarea
                                placeholder="Jelaskan fungsi dari izin ini..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="bg-white/50 dark:bg-zinc-900/50 min-h-[100px]"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">

                            <ButtonsComponentsSave
                                title="Permission"
                                isLoading={loading}
                            />

                            {/* <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Simpan
                                    </>
                                )}
                            </Button> */}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
