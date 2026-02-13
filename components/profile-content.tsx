"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, Key, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProfileContent() {
    const { data: session } = useSession();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data);
                    setFormData({
                        nickname: data.nickname || "",
                        email: data.email || "",
                    });
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchUser();
        }
    }, [session]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.id) return;

        try {
            setSaving(true);
            const res = await fetch(`/api/users/${userData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nickname: formData.nickname,
                    email: formData.email,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Gagal memperbarui profil");
            }

            toast.success("Profil berhasil diperbarui");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.id) return;

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Password baru dan konfirmasi tidak cocok");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password baru minimal 6 karakter");
            return;
        }

        try {
            setChangingPassword(true);
            const res = await fetch(`/api/users/${userData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: passwords.newPassword,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Gagal mengubah password");
            }

            toast.success("Password berhasil diubah");
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details and profile information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="nickname" className="text-xs font-bold uppercase text-muted-foreground">Nickname / Nama Panggilan</Label>
                                    <Input
                                        id="nickname"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Email tidak dapat diubah untuk saat ini.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">Member Status</Label>
                                    <div className="h-10 flex items-center">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                                            {userData?.type || "User"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-muted-foreground">User ID</Label>
                                    <Input value={`#${userData?.id}`} disabled className="bg-slate-50 font-mono" />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        <><Save className="mr-2 h-4 w-4" /> Simpan Profil</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences and status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold uppercase">Account Status</Label>
                                <p className="text-muted-foreground text-xs font-medium">Your account is currently {userData?.status}</p>
                            </div>
                            <Badge variant="outline" className={`border-green-200 bg-green-50 text-green-700 capitalize ${userData?.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {userData?.status}
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold uppercase">Points Balance</Label>
                                <p className="text-muted-foreground text-xs font-medium">Accumulated rewards points</p>
                            </div>
                            <div className="text-lg font-bold text-orange-600">{userData?.point || 0} PTS</div>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold uppercase">Data Protection</Label>
                                <p className="text-muted-foreground text-xs font-medium">
                                    Enable privacy mode for your profile
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="text-destructive text-sm font-bold uppercase">Danger Zone</CardTitle>
                        <CardDescription>Irreversible and destructive actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-sm font-bold">Delete Account</Label>
                                <p className="text-muted-foreground text-xs font-medium">
                                    Permanently delete your account and all data
                                </p>
                            </div>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Akun
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Keamanan Akun</CardTitle>
                        <CardDescription>Perbarui password Anda untuk menjaga keamanan akun.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" title="Maaf, fitur verifikasi password lama belum tersedia" className="text-xs font-bold uppercase text-muted-foreground opacity-50">Password Saat Ini (Optional)</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.currentPassword}
                                        onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    />
                                </div>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-xs font-bold uppercase text-muted-foreground">Password Baru</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.newPassword}
                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-muted-foreground">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={changingPassword}>
                                    {changingPassword ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengubah...</>
                                    ) : (
                                        <><Key className="mr-2 h-4 w-4" /> Perbarui Password</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
