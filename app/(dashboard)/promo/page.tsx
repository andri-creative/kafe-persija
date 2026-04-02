"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Ticket, Plus, Timer, Megaphone, 
    Image as ImageIcon, MoreHorizontal, 
    Eye, Edit3, Trash2, Calendar, 
    Percent, BadgeDollarSign, 
    ChevronRight, CheckCircle2, XCircle,
    Zap, Sparkles, Filter, 
    ArrowRight, Save, X, Info
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Promo {
    id: number;
    code_promo: string;
    type: "percentage" | "fixed";
    value: number;
    title: string;
    desc: string;
    min_order: number;
    max_usage: number;
    usage_per_user: number;
    start_date: string;
    end_date: string;
    status: "active" | "inactive";
    all_product: boolean;
    created_by: number;
    image?: string | null;
}

const promos: Promo[] = [
    {
        id: 1,
        code_promo: "HEMAT10",
        type: "percentage",
        value: 10,
        title: "Diskon 10% Semua Produk",
        desc: "Diskon 10% untuk semua produk tanpa minimal belanja",
        min_order: 0,
        max_usage: 1000,
        usage_per_user: 2,
        start_date: "2026-04-01",
        end_date: "2026-04-30",
        status: "active",
        all_product: true,
        created_by: 1,
        image: null,
    },
    {
        id: 2,
        code_promo: "POTONG20",
        type: "fixed",
        value: 20000,
        title: "Potongan Rp20.000",
        desc: "Minimal belanja Rp100.000 dapat potongan Rp20.000",
        min_order: 100000,
        max_usage: 500,
        usage_per_user: 1,
        start_date: "2026-04-01",
        end_date: "2026-05-15",
        status: "active",
        all_product: true,
        created_by: 2,
        image: null,
    },
];

export default function PromoPage() {
    const [isOpen, setIsOpen] = useState(false);

    const formatValue = (p: Promo) => {
        if (p.type === "percentage") return `${p.value}%`;
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(p.value);
    };

    return (
        <div className="flex-1 p-6 lg:p-8 bg-zinc-50/10 min-h-screen">
            
            {/* PREUMIUM BANNER HEADER */}
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
                    </div>

                    <div className="flex items-center gap-3">
                         <Sheet open={isOpen} onOpenChange={setIsOpen}>
                             <SheetTrigger asChild>
                                 <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 border-b-4 border-orange-700">
                                    <Plus className="mr-2 h-4 w-4" /> Create New Promo
                                 </Button>
                             </SheetTrigger>
                             <SheetContent side="right" className="w-[400px] sm:w-[540px] border-none shadow-2xl p-0 overflow-hidden bg-white">
                                <div className="h-full flex flex-col">
                                    <div className="p-8 bg-indigo-950 text-white relative">
                                         <div className="absolute top-0 right-0 p-8 opacity-10">
                                              <Sparkles className="h-24 w-24 rotate-12" />
                                         </div>
                                         <SheetHeader className="text-left relative z-10">
                                             <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white mb-4">
                                                 <Ticket className="h-5 w-5" />
                                             </div>
                                             <SheetTitle className="text-2xl font-black uppercase text-white tracking-tight">Create Promotion</SheetTitle>
                                             <SheetDescription className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                                                 Add a new coupon or banner to your marketing campaign
                                             </SheetDescription>
                                         </SheetHeader>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
                                        {/* Section: Basic Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                 <Info className="h-4 w-4 text-orange-500" />
                                                 <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Basic Information</span>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="title" className="text-[10px] font-black uppercase text-zinc-500">Promo Title</Label>
                                                <Input id="title" placeholder="e.g. Diskon Ramadhan Barokah" className="rounded-xl border-zinc-100 bg-zinc-50/50 py-6" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="code" className="text-[10px] font-black uppercase text-zinc-500">Unique Code</Label>
                                                    <Input id="code" placeholder="RAMADHAN24" className="rounded-xl border-zinc-100 bg-zinc-50/50 py-6 font-mono font-bold uppercase" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="type" className="text-[10px] font-black uppercase text-zinc-500">Promo Type</Label>
                                                    <Select defaultValue="percentage">
                                                        <SelectTrigger className="rounded-xl border-zinc-100 bg-zinc-50/50 h-12">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                            <SelectItem value="fixed">Fixed Amount (Rp)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="value" className="text-[10px] font-black uppercase text-zinc-500">Discount Value</Label>
                                                <Input id="value" type="number" placeholder="10" className="rounded-xl border-zinc-100 bg-zinc-50/50 py-6" />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="desc" className="text-[10px] font-black uppercase text-zinc-500">Description</Label>
                                                <Textarea id="desc" placeholder="Details about this promo..." className="rounded-xl border-zinc-100 bg-zinc-50/50 min-h-[100px]" />
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-50" />

                                        {/* Section: Rules */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                 <Zap className="h-4 w-4 text-orange-500" />
                                                 <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Usage Rules</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Min. Order (Rp)</Label>
                                                    <Input type="number" placeholder="50000" className="rounded-xl border-zinc-100 bg-zinc-50/50 py-6" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Max. Usage</Label>
                                                    <Input type="number" placeholder="1000" className="rounded-xl border-zinc-100 bg-zinc-50/50 py-6" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                                                 <div className="space-y-0.5">
                                                     <p className="text-[10px] font-black uppercase text-zinc-900">All Products?</p>
                                                     <p className="text-[9px] font-bold text-zinc-400">Promo applies to everything</p>
                                                 </div>
                                                 <Switch />
                                            </div>
                                        </div>

                                        <Separator className="bg-zinc-50" />

                                        {/* Section: Period */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                 <Calendar className="h-4 w-4 text-orange-500" />
                                                 <span className="text-xs font-black uppercase text-zinc-400 tracking-widest">Active Period</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Start Date</Label>
                                                    <Input type="date" className="rounded-xl border-zinc-100 bg-zinc-50/50 h-12" />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-[10px] font-black uppercase text-zinc-500">End Date</Label>
                                                    <Input type="date" className="rounded-xl border-zinc-100 bg-zinc-50/50 h-12" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 bg-white border-t border-zinc-50 flex items-center gap-3">
                                         <Button variant="ghost" onClick={() => setIsOpen(false)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-zinc-400">
                                              Cancel
                                         </Button>
                                         <Button className="flex-[2] bg-indigo-950 hover:bg-indigo-900 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-950/20">
                                              <Save className="mr-2 h-4 w-4" /> Save New Promo
                                         </Button>
                                    </div>
                                </div>
                             </SheetContent>
                         </Sheet>
                    </div>
                </div>
            </div>

            {/* Promo Grid - 4 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {promos.map((promo) => (
                    <div key={promo.id} className="group relative">
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3 z-10 transition-transform group-hover:scale-95 group-active:scale-90">
                            <Badge className={`border-none px-2.5 py-0.5 rounded-lg font-black text-[8px] uppercase tracking-wider shadow-md ${
                                promo.status === "active" 
                                ? "bg-green-500 text-white" 
                                : "bg-zinc-200 text-zinc-500"
                            }`}>
                                {promo.status === "active" ? (
                                    <span className="flex items-center gap-1"><div className="h-1 w-1 rounded-full bg-white animate-pulse" /> Live</span>
                                ) : "Selesai"}
                            </Badge>
                        </div>

                        {/* Card Container Compact */}
                        <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[1.5rem] bg-white overflow-hidden h-full flex flex-col border border-zinc-50/50 group-hover:-translate-y-1">
                            {/* Promo Image Area Compact h-32 */}
                            <div className="relative h-36 w-full bg-zinc-50 overflow-hidden border-b border-zinc-50">
                                {promo.image ? (
                                    <img src={promo.image} alt={promo.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-white relative">
                                        <div className="absolute inset-0 opacity-5">
                                            <Zap className="h-full w-full p-4" />
                                        </div>
                                        <Ticket className="h-10 w-10 text-zinc-100 group-hover:rotate-12 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-white/50 flex items-center justify-between pointer-events-none group-hover:bg-white transition-colors">
                                     <div className="flex flex-col">
                                         <span className="text-[7px] font-black text-zinc-400 uppercase leading-none mb-0.5">Voucher Code</span>
                                         <span className="text-sm font-black text-zinc-900 uppercase tracking-tighter">{promo.code_promo}</span>
                                     </div>
                                     <div className="h-8 w-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-sm shadow-orange-100/50">
                                          {promo.type === "percentage" ? <Percent className="h-4 w-4" /> : <BadgeDollarSign className="h-4 w-4" />}
                                     </div>
                                </div>
                            </div>

                            {/* Content Area Compact */}
                            <CardContent className="p-5 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-[13px] font-black text-zinc-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1 leading-tight">{promo.title}</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 line-clamp-1 leading-none mb-4 uppercase tracking-tighter italic">{promo.desc}</p>
                                    
                                    <div className="space-y-1.5 mb-5 text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-200" />
                                            <span>{promo.start_date} - {promo.end_date}</span>
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
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-zinc-100 bg-white hover:bg-orange-50 hover:text-orange-600 text-zinc-400 shadow-sm transition-all active:scale-90" title="Edit">
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        
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
                                                <DropdownMenuItem className="py-2 text-red-600 focus:bg-red-50 focus:text-red-600 flex justify-between cursor-pointer rounded-xl">
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

                {/* Add New Placeholder Compact */}
                <div 
                    onClick={() => setIsOpen(true)}
                    className="h-full min-h-[260px] border-2 border-dashed border-zinc-100 rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:border-orange-200 transition-all active:scale-[0.98] bg-zinc-50/20"
                >
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-300 mb-3 group-hover:bg-orange-50 group-hover:text-orange-400 transition-all duration-300 transform group-hover:rotate-90">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-700 transition-colors">Tambah Promo Baru</span>
                </div>
            </div>
        </div>
    );
}
