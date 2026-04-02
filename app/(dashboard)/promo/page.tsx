"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Ticket, Plus, Timer, Megaphone, 
    Image as ImageIcon, MoreHorizontal, 
    Eye, Edit3, Trash2, Calendar, 
    Percent, BadgeDollarSign, 
    ChevronRight, CheckCircle2, XCircle,
    Zap, Sparkles, Filter, 
    ArrowRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { getPromos, deletePromo, PromoPayload } from "@/lib/promo-api";
import { toast } from "react-hot-toast";

export default function PromoPage() {
    const [promos, setPromos] = React.useState<PromoPayload[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchPromos = async () => {
        try {
            setIsLoading(true);
            const data = await getPromos();
            setPromos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch promos", error);
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    };

    // Dynamic stats
    const activePromos = promos.filter(p => p.is_active).length;
    const expiredToday = promos.filter(p => {
        if (!p.end_date) return false;
        const end = new Date(p.end_date);
        const today = new Date();
        return end.toDateString() === today.toDateString();
    }).length;

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this promo?")) return;
        try {
            await deletePromo(id);
            toast.success("Promo deleted successfully");
            fetchPromos();
        } catch (error) {
            toast.error("Failed to delete promo");
        }
    };

    React.useEffect(() => {
        fetchPromos();
    }, []);

    const formatValue = (p: any) => {
        if (p.type === "percentage") return `${p.value}%`;
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.value);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-8 bg-zinc-50/10 min-h-screen">
            
            {/* PREUMIUM BANNER HEADER (V2 Style) */}
            <div className="relative mb-10 overflow-hidden rounded-[2rem] bg-indigo-950 p-8 shadow-2xl shadow-indigo-900/20">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl opacity-50" />
                <div className="absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-indigo-900/50 to-transparent" />
                <div className="absolute bottom-6 right-8 opacity-20 pointer-events-none">
                     <Ticket className="h-24 w-24 text-white rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                 <Sparkles className="h-4 w-4" />
                             </div>
                             <Badge variant="outline" className="border-indigo-400/30 text-indigo-200 text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">
                                Marketing Portal
                             </Badge>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight text-white uppercase leading-none">Promo & Banner</h2>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest max-w-md">Optimize your cafe marketing and increase sales with effective vouchers and campaigns</p>
                        </div>

                        {/* Stats Integrated in Header - NOW DYNAMIC */}
                        <div className="flex items-center gap-6 pt-2">
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-indigo-400 uppercase mb-0.5">Active Promo</span>
                                 <span className="text-xl font-black text-white leading-none">
                                     {isLoading ? ".." : activePromos.toString().padStart(2, '0')}
                                 </span>
                             </div>
                             <div className="h-8 w-px bg-indigo-800" />
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-indigo-400 uppercase mb-0.5">Expired Today</span>
                                 <span className="text-xl font-black text-white leading-none">
                                     {isLoading ? ".." : expiredToday.toString().padStart(2, '0')}
                                 </span>
                             </div>
                             <div className="h-8 w-px bg-indigo-800" />
                             <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-indigo-400 uppercase mb-0.5">Voucher Count</span>
                                 <span className="text-xl font-black text-indigo-500 leading-none">
                                     {isLoading ? ".." : promos.length.toString().padStart(2, '0')}
                                 </span>
                             </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-md transition-all active:scale-95">
                             <Filter className="h-5 w-5" />
                         </Button>
                         <Link href="/promo/create">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 border-b-4 border-orange-700">
                                <Plus className="mr-2 h-4 w-4" /> Create New Promo
                            </Button>
                         </Link>
                    </div>
                </div>
            </div>

            <Separator className="mb-10 bg-zinc-200/40" />

            {/* Promo Grid - 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    // Premium Skeleton Loading
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-[380px] rounded-[1.5rem] bg-zinc-100 animate-pulse border border-zinc-50" />
                    ))
                ) : (
                    <>
                        {promos.map((promo: any) => (
                            <div key={promo.id} className="group relative">
                                {/* Status Badge */}
                                <div className="absolute top-3 left-3 z-10 transition-transform group-hover:scale-95 group-active:scale-90">
                                    <Badge className={`border-none px-2.5 py-0.5 rounded-lg font-black text-[8px] uppercase tracking-wider shadow-md ${
                                        promo.is_active || promo.status === "active" 
                                        ? "bg-green-500 text-white" 
                                        : "bg-zinc-200 text-zinc-500"
                                    }`}>
                                        {promo.is_active || promo.status === "active" ? (
                                            <span className="flex items-center gap-1"><div className="h-1 w-1 rounded-full bg-white animate-pulse" /> Live</span>
                                        ) : "Selesai"}
                                    </Badge>
                                </div>

                                {/* Card Container Compact */}
                                <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[1.5rem] bg-white overflow-hidden h-full flex flex-col border border-zinc-50/50 group-hover:-translate-y-1">
                                    {/* Promo Image Area Compact h-32 */}
                                    <div className="relative h-36 w-full bg-zinc-50 overflow-hidden border-b border-zinc-50">
                                        {promo.image ? (
                                            <img src={promo.image} alt={promo.name || promo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-zinc-50 to-white relative">
                                                <div className="absolute inset-0 opacity-5">
                                                    <Zap className="h-full w-full p-4" />
                                                </div>
                                                <Ticket className="h-10 w-10 text-zinc-100 group-hover:rotate-12 transition-transform duration-500" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/50 flex items-center justify-between pointer-events-none group-hover:bg-white transition-colors">
                                             <div className="flex flex-col">
                                                 <span className="text-[7px] font-black text-zinc-400 uppercase leading-none mb-0.5">Voucher Code</span>
                                                 <span className="text-sm font-black text-zinc-900 uppercase tracking-tighter">{promo.code_promo || "-"}</span>
                                             </div>
                                             <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm shadow-orange-100/50">
                                                  {promo.type === "percentage" ? <Percent className="h-4 w-4" /> : <BadgeDollarSign className="h-4 w-4" />}
                                             </div>
                                        </div>
                                    </div>

                                    {/* Content Area Compact */}
                                    <CardContent className="p-5 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h3 className="text-[13px] font-black text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1 leading-tight">{promo.name || promo.title}</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 line-clamp-1 leading-none mb-4 uppercase tracking-tighter italic">{promo.description || promo.desc}</p>
                                            
                                            <div className="space-y-1.5 mb-5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 w-3.5 text-zinc-200" />
                                                    <span className="truncate">{formatDate(promo.start_date)} - {formatDate(promo.end_date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider & Actions Compact */}
                                        <div className="pt-4 border-t border-zinc-50 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-zinc-300 uppercase leading-none mb-1">Max Potongan</span>
                                                <span className="text-base font-black text-indigo-600 tracking-tighter">{formatValue(promo)}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Link href={`/promo/edit/${promo.id}`}>
                                                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-zinc-100 bg-white hover:bg-orange-50 hover:text-orange-600 text-zinc-400 shadow-sm transition-all active:scale-90" title="Edit">
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Link>
                                                
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-zinc-300 hover:bg-zinc-50">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[150px] rounded-2xl font-black text-[10px] uppercase p-1">
                                                        <DropdownMenuItem className="flex justify-between py-2 text-zinc-600 cursor-pointer rounded-xl">
                                                            View Details <Eye className="h-3.5 w-3.5" />
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(promo.id)}
                                                            className="py-2 text-red-600 focus:bg-red-50 focus:text-red-600 flex justify-between cursor-pointer rounded-xl"
                                                        >
                                                            Remove <Trash2 className="h-3.5 w-3.5" />
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}

                        {/* Add New Placeholder Card - Navigates to Create Page */}
                        <Link href="/promo/create" className="h-full">
                            <div className="h-full min-h-[380px] border-2 border-dashed border-zinc-100 rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-orange-200 transition-all active:scale-[0.98] bg-zinc-50/20">
                                <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300 mb-3 group-hover:bg-orange-50 group-hover:text-orange-400 transition-all duration-300 transform group-hover:rotate-90">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-700 transition-colors">Tambah Promo Baru</span>
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
