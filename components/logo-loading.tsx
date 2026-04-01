"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LogoLoadingProps {
    width?: number;
    height?: number;
    className?: string;
}

export const LogoLoading = ({ width = 200, height = 200, className }: LogoLoadingProps) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                animate={{
                    scale: [1, 0.95, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="relative overflow-hidden rounded-full p-2 bg-white/5 border border-white/10"
                style={{ width, height }}
            >
                {/* Image Logo */}
                <Image
                    src="/web-logo.svg"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                />

                {/* Shimmer / Glint effect - Enhanced visibility */}
                <motion.div
                    initial={{ left: "-150%", skewX: -45 }}
                    animate={{ left: "150%" }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                        repeatDelay: 1
                    }}
                    className="absolute top-0 h-full w-4/5 bg-linear-to-r from-transparent via-white/50 to-transparent pointer-events-none"
                    style={{ 
                        zIndex: 1,
                        boxShadow: "0 0 40px 10px rgba(255, 255, 255, 0.3)"
                    }}
                />
            </motion.div>
        </div>
    );
};
