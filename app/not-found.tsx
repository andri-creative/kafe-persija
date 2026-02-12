import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
            <div className="mb-8 animate-in fade-in zoom-in duration-500">
                <Image
                    src="/icons/favicon-for-app/apple-icon.png"
                    alt="Persija Cafe Logo"
                    width={100}
                    height={100}
                    className="mx-auto drop-shadow-sm"
                />
            </div>

            <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-gray-100 select-none mb-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 mt-[-40px]">
                404
            </h1>

            <div className="space-y-4 relative z-10 px-4">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Halaman Tidak Ditemukan
                </h2>
                <p className="text-gray-500 max-w-md mx-auto font-medium">
                    Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan ke alamat lain.
                </p>
                <div className="pt-6">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95">
                        <Link href="/">
                            Kembali ke Beranda
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="mt-12 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                Persija Cafe POS System
            </div>
        </div>
    );
}