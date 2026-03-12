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
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
    return (
        <div className="container max-w-2xl mx-auto px-3 py-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Link href="/users">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-base font-medium">Tambah User</h1>
                    <p className="text-xs text-muted-foreground">Buat akun baru</p>
                </div>
            </div>

            {/* Form Card */}
            <Card className="border shadow-none">
                <CardContent className="p-4 space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="fullname" className="text-xs font-medium">
                            Nama <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="fullname"
                            placeholder="Nama lengkap"
                            className="h-8 text-xs bg-muted/50 focus:bg-white px-3"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs font-medium">
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            className="h-8 text-xs bg-muted/50 focus:bg-white px-3"
                        />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-xs font-medium">
                            Password <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min. 8 karakter"
                            className="h-8 text-xs bg-muted/50 focus:bg-white px-3"
                        />
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label htmlFor="role" className="text-xs font-medium">
                            Role <span className="text-destructive">*</span>
                        </Label>
                        <Select>
                            <SelectTrigger
                                id="role"
                                className="h-8 text-xs bg-muted/50 focus:bg-white px-3"
                            >
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN" className="text-xs">Admin</SelectItem>
                                <SelectItem value="STAFF" className="text-xs">Staff</SelectItem>
                                <SelectItem value="USER" className="text-xs">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <Link href="/users">
                            <Button
                                variant="ghost"
                                type="button"
                                className="h-7 px-3 text-xs"
                            >
                                Batal
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            className="h-7 px-4 text-xs font-medium"
                        >
                            Simpan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Hint Text */}
            <p className="text-center text-[9px] text-muted-foreground/60 mt-3">
                User aktif setelah ditambahkan
            </p>
        </div>
    );
}
