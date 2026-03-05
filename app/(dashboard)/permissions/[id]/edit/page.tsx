"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Key, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-toastify";
import { ButtonsComponentsBack, ButtonsComponentsSave } from "@/components/buttons-conponents";

export default function PermissionEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [permissionId, setPermissionId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    useEffect(() => {
        params.then(({ id }) => {
            setPermissionId(id);
            fetchPermission(id);
        });
    }, [params]);

    const fetchPermission = async (id: string) => {
        try {
            const res = await fetch(`/api/permissions/${id}`);
            if (!res.ok) throw new Error("Gagal memuat data");
            const data = await res.json();
            setForm({
                name: data.name || "",
                description: data.description || ""
            });
        } catch (error) {
            toast.error("Gagal memuat data izin");
            router.push("/permissions");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Nama izin wajib diisi");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/permissions/${permissionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal memperbarui izin");
            }

            toast.success("Izin berhasil diperbarui");
            router.push("/permissions");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this permission?")) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/permissions/${permissionId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Gagal menghapus izin");
            toast.success("Izin berhasil dihapus");
            router.push("/permissions");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 min-h-screen max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <ButtonsComponentsBack backUrl="/permissions" title="Permission" showText />
                </div>
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
                            <ButtonsComponentsSave title="Permission" isLoading={saving} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
