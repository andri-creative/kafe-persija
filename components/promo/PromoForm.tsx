"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { 
    Ticket, Save, Sparkles, Info, Zap, Calendar,
    Percent, BadgeDollarSign, CheckCircle2, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PromoPayload } from "@/lib/promo-api";

interface PromoFormProps {
    initialData?: PromoPayload;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    title: string;
    subtitle: string;
}

export default function PromoForm({ 
    initialData, 
    onSubmit, 
    isLoading, 
    title, 
    subtitle 
}: PromoFormProps) {
    const [formData, setFormData] = React.useState({
        name: "",
        code_promo: "",
        type: "percentage" as "percentage" | "fixed",
        value: 0,
        description: "",
        min_order: 0,
        max_usage: 1000,
        start_date: "",
        end_date: "",
        is_active: true,
        all_product: true
    });

    // Re-initialize form data when initialData arrives
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || initialData.title || "",
                code_promo: initialData.code_promo || "",
                type: (initialData.type as any) || "percentage",
                value: initialData.value || 0,
                description: initialData.description || initialData.desc || "",
                min_order: initialData.min_order || 0,
                max_usage: initialData.max_usage || 1000,
                start_date: initialData.start_date ? new Date(initialData.start_date).toISOString().slice(0, 16) : "",
                end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().slice(0, 16) : "",
                is_active: initialData.is_active ?? (initialData.status === "active"),
                all_product: initialData.all_product ?? true
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
            {/* Header Banner */}
            <div className="relative mb-10 overflow-hidden rounded-[2rem] bg-indigo-950 p-8 shadow-2xl shadow-indigo-900/20 border border-white/5">
                <div className="absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-indigo-900/50 to-transparent" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <Badge variant="outline" className="border-indigo-400/30 text-indigo-400 text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">
                                Promo Factory
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight text-white uppercase leading-none">{title}</h2>
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest leading-none mt-1">{subtitle}</p>
                        </div>
                    </div>
                    <Button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest px-10 h-14 rounded-2xl shadow-xl shadow-orange-500/30 border-b-4 border-orange-700 active:scale-95 transition-all"
                    >
                        <Save className="mr-2 h-4 w-4" /> {isLoading ? "Processing..." : "Save Campaign"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Form Details */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-8">
                        <div className="space-y-8">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Info className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Campaign Details</span>
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Display Title</Label>
                                    <Input 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. Weekend Flash Sale 30%" 
                                        className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 px-6 font-bold" 
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Unique Voucher Code</Label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500">
                                            <Ticket className="h-4 w-4" />
                                        </div>
                                        <Input 
                                            value={formData.code_promo}
                                            onChange={(e) => setFormData({...formData, code_promo: e.target.value.toUpperCase()})}
                                            placeholder="PERSIJA30" 
                                            className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 pl-14 pr-6 font-black tracking-widest uppercase text-indigo-600 focus:bg-white transition-all" 
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Description</Label>
                                    <Textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Add more details about this offer..." 
                                        className="rounded-2xl min-h-[100px] border-zinc-100 bg-zinc-50/50 p-6 leading-relaxed" 
                                    />
                                </div>
                            </div>

                            <Separator className="bg-zinc-50" />

                            {/* Logic Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Zap className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Reward Logic</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="grid gap-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Discount Type</Label>
                                        <Select 
                                            value={formData.type}
                                            onValueChange={(v: any) => setFormData({...formData, type: v})}
                                        >
                                            <SelectTrigger className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 px-6">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed (IDR)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Amount</Label>
                                        <Input 
                                            value={formData.value}
                                            onChange={(e) => setFormData({...formData, value: Number(e.target.value)})}
                                            type="number" 
                                            className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 px-6 font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Rules Card */}
                    <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-8">
                         <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Requirement Rules</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Minimum Order (Rp)</Label>
                                    <Input 
                                        value={formData.min_order}
                                        onChange={(e) => setFormData({...formData, min_order: Number(e.target.value)})}
                                        type="number" 
                                        className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 px-6" 
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Total Usage Cap</Label>
                                    <Input 
                                        value={formData.max_usage}
                                        onChange={(e) => setFormData({...formData, max_usage: Number(e.target.value)})}
                                        type="number" 
                                        className="rounded-2xl h-14 border-zinc-100 bg-zinc-50/50 px-6" 
                                    />
                                </div>
                            </div>
                         </div>
                    </Card>
                </div>

                {/* Right Column: Meta */}
                <div className="lg:col-span-4 space-y-6">
                     <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-8">
                         <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Calendar className="h-3.5 w-3.5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Availability</span>
                            </div>
                            <div className="grid gap-5">
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Valid From</Label>
                                    <Input 
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                        type="datetime-local" 
                                        className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50 px-6 font-bold" 
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-tighter">Until Date</Label>
                                    <Input 
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                        type="datetime-local" 
                                        className="rounded-xl h-12 border-zinc-100 bg-zinc-50/50 px-6 font-bold" 
                                    />
                                </div>
                            </div>
                         </div>
                     </Card>

                     <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white p-8 border border-zinc-50/50">
                          <div className="space-y-6">
                               <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-900 leading-none tracking-tighter">Live Status</p>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter italic">Published instantly</p>
                                    </div>
                                    <Switch 
                                        checked={formData.is_active}
                                        onCheckedChange={(v) => setFormData({...formData, is_active: v})}
                                    />
                               </div>
                               <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-zinc-900 leading-none tracking-tighter">All Access</p>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter italic">Broad scope</p>
                                    </div>
                                    <Switch 
                                        checked={formData.all_product}
                                        onCheckedChange={(v) => setFormData({...formData, all_product: v})}
                                    />
                               </div>
                          </div>
                     </Card>
                </div>
            </div>
        </form>
    );
}
