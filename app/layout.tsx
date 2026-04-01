import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ToastProvider from "@/components/providers/toast-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport = {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "Persija Cafe POS",
    description: "Persija Cafe Management System",
    manifest: "/manifest.json",
    icons: {
        icon: "/icons/favicon-for-app/favicon.ico",
        shortcut: "/icons/favicon-for-app/favicon.ico",
        apple: "/icons/favicon-for-app/apple-icon.png",
        other: {
            rel: "apple-touch-icon-precomposed",
            url: "/icons/favicon-for-app/apple-icon.png",
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Persija POS",
    },
    formatDetection: {
        telephone: false,
    },
};



export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-title" content="Caffee Persija" />
            </head>

            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <ToastProvider />
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
