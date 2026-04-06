"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScrean";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/menu") || pathname.startsWith("/layar-tv") || pathname.startsWith("/order")) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <>
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div 
                        key="loading-screen"
                        className="fixed inset-0 z-9999 flex items-center justify-center bg-white dark:bg-zinc-950"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        <LoadingScreen width={180} height={180} />
                    </motion.div>
                )}
            </AnimatePresence>
            <div className={isLoading ? "hidden" : "block transition-all duration-500"}>
                {children}
            </div>
        </>
    );
}
