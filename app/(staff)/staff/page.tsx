import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function StaffPage() {
    const stats = [
        {
            title: "Pesanan Masuk",
            value: "12",
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-100 dark:bg-blue-900/20"
        },
        {
            title: "Sedang Diproses",
            value: "5",
            icon: AlertCircle,
            color: "text-orange-600",
            bg: "bg-orange-100 dark:bg-orange-900/20"
        },
        {
            title: "Siap Disajikan",
            value: "8",
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-100 dark:bg-green-900/20"
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Monitoring Order</h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Kelola dan pantau pesanan pelanggan secara real-time.
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} p-2 rounded-full`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Order Monitoring Area */}
            <Card className="min-h-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Daftar Antrian Pesanan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4 border-2 border-dashed rounded-lg">
                        <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                            <ClipboardList className="h-8 w-8 text-zinc-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium">Belum ada pesanan aktif</p>
                            <p className="text-sm">Semua pesanan yang masuk akan muncul di sini.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}