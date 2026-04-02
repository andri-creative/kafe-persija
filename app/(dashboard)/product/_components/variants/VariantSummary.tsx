"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingDown, TrendingUp } from "lucide-react";

interface Variant {
  price: number;
}

interface VariantSummaryProps {
  variants: Variant[];
}

export function VariantSummary({ variants }: VariantSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
  const maxPrice = variants.length > 0 ? Math.max(...variants.map((v) => v.price)) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <Card className="border-none shadow-xl bg-linear-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white overflow-hidden group">
        <CardContent className="p-6 relative">
          <Package className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 rotate-12 transition-transform group-hover:scale-110" />
          <div className="text-3xl font-black">{variants.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/70">Total Variants</div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden group">
        <CardContent className="p-6 relative border-l-4 border-emerald-500">
          <TrendingDown className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-emerald-500/10 rotate-12 transition-transform group-hover:scale-110" />
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(minPrice)}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lowest Price</div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md overflow-hidden group">
        <CardContent className="p-6 relative border-l-4 border-amber-500">
          <TrendingUp className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-amber-500/10 rotate-12 transition-transform group-hover:scale-110" />
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {formatPrice(maxPrice)}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Highest Price</div>
        </CardContent>
      </Card>
    </div>
  );
}
