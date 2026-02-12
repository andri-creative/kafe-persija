import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Link href="/admin/users">
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black">Tambah User Baru</h1>
            </div>

            <Card className="border-0 shadow-sm max-w-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Informasi User</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Silakan isi data user di bawah ini untuk menambahkan akses ke sistem.
                    </p>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                placeholder="Masukkan nama lengkap"
                                className="bg-gray-50/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@persija-kafe.com"
                                className="bg-gray-50/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="********"
                                className="bg-gray-50/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select>
                                <SelectTrigger id="role" className="bg-gray-50/50">
                                    <SelectValue placeholder="Pilih Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                                    <SelectItem value="USER">USER</SelectItem>
                                    <SelectItem value="STAFF">STAFF</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin/users">
                                <Button variant="ghost" type="button" className="cursor-pointer">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" className="cursor-pointer font-bold px-8">
                                Simpan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
