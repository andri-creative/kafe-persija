"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();

    const [user, setUser] = useState<any>(null);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: "",
        status: "active",
        role_id: "",
    });

    const isSelf = session?.user?.id === id;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [userRes, rolesRes] = await Promise.all([
                    fetch(`/api/users/${id}`),
                    fetch("/api/roles")
                ]);

                if (!userRes.ok) throw new Error("Gagal mengambil data user");
                if (!rolesRes.ok) throw new Error("Gagal mengambil data role");

                const userData = await userRes.json();
                const rolesData = await rolesRes.json();

                setUser(userData);
                setRoles(rolesData);

                setFormData({
                    nickname: userData.nickname,
                    email: userData.email,
                    password: "",
                    status: userData.status || "active",
                    role_id: userData.user_role_trx?.[0]?.role_id?.toString() || ""
                });
            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nickname: formData.nickname,
                    email: formData.email,
                    password: formData.password || undefined,
                    status: formData.status,
                    role_id: parseInt(formData.role_id)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal mengupdate user");
            }

            toast.success("User berhasil diupdate");
            router.push("/admin/users");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const res = await fetch(`/api/users/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Gagal menghapus user");
            }

            toast.success("User berhasil dihapus");
            router.push("/admin/users");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto px-3 py-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-muted-foreground">Memuat data user...</p>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container max-w-4xl mx-auto px-3 py-12 text-center">
                <p className="text-red-500 font-medium">{error || "User tidak ditemukan"}</p>
                <Link href="/admin/users" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
                    Kembali ke daftar user
                </Link>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link href="/admin/users">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Edit Profile User</h1>
                        <p className="text-xs text-muted-foreground">Update informasi dan hak akses akun</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={isSelf}
                    >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus User
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* BAGIAN KIRI: INFORMASI UTAMA (Span 2 Kolom) */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="shadow-sm border-muted">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4 pb-2 border-b">Informasi Pribadi</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nickname" className="text-xs font-medium">Nama Lengkap</Label>
                                        <Input
                                            id="nickname"
                                            value={formData.nickname}
                                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                            className="h-9 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-medium">Alamat Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="h-9 text-sm"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-xs font-medium">Ubah Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="h-9 text-sm"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Kosongkan jika tidak ingin mengubah password lama.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* BAGIAN KANAN: PENGATURAN AKSES & INFO */}
                    <div className="space-y-6">
                        <Card className="shadow-sm border-muted bg-slate-50/50">
                            <CardContent className="p-6">
                                <h2 className="text-sm font-semibold mb-4 pb-2 border-b">Akses & Status</h2>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-xs font-medium">Role User</Label>
                                        <Select
                                            value={formData.role_id}
                                            onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                                        >
                                            <SelectTrigger id="role" className="h-9 text-sm bg-white uppercase">
                                                <SelectValue placeholder="Pilih role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()} className="text-xs uppercase">
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-xs font-medium">Status Akun</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                                        >
                                            <SelectTrigger id="status" className="h-9 text-sm bg-white">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active" className="text-xs">Aktif</SelectItem>
                                                <SelectItem value="inactive" className="text-xs">Nonaktif</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Detail Meta Data */}
                                <div className="mt-8 pt-4 border-t space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-muted-foreground uppercase">User ID</span>
                                        <span className="text-[10px] font-mono font-bold">#{user.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[10px] text-muted-foreground uppercase">Terdaftar</span>
                                        <span className="text-[10px]">
                                            {new Date(user.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-2">
                            <Button type="submit" className="w-full h-9 text-sm" disabled={saving}>
                                {saving ? <><Loader2 className="h-3 w-3 mr-2 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
                            </Button>
                            <Link href="/admin/users" className="w-full">
                                <Button variant="ghost" type="button" className="w-full h-9 text-sm" disabled={saving}>
                                    Batal
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus akun <strong>{user.nickname}</strong> secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleting}
                        >
                            {deleting ? "Menghapus..." : "Hapus"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
