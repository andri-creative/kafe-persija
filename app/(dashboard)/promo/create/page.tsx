"use client";
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPromo } from "@/lib/promo-api";
import { toast } from "react-hot-toast";
import PromoForm from "@/components/promo/PromoForm";

export default function CreatePromoPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (formData: any) => {
        try {
            // Validation
            if (!formData.name) {
                toast.error("Judul promo wajib diisi");
                return;
            }
            if (!formData.code_promo) {
                toast.error("Kode voucher wajib diisi");
                return;
            }
            if (!formData.value || formData.value <= 0) {
                toast.error("Nilai diskon harus lebih dari 0");
                return;
            }
            if (!formData.start_date || !formData.end_date) {
                toast.error("Masa berlaku wajib diatur");
                return;
            }

            setIsLoading(true);
            const response = await createPromo(formData);
            
            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success("Promo Campaign created successfully");
            router.push("/promo");
        } catch (error: any) {
            console.error("POST ERROR:", error);
            const errMsg = error.response?.data?.error || "Failed to create campaign. Please try again.";
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 p-6 lg:p-10 bg-zinc-50/10 min-h-screen">
            {/* Back Navigation */}
            <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-6 group"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Marketing
            </button>

            <PromoForm 
                onSubmit={handleSubmit}
                isLoading={isLoading}
                title="New Promotion"
                subtitle="Create a strategic voucher or banner for your cafe"
            />
        </div>
    );
}
