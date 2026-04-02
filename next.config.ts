import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
  },
  cacheOnFrontEndNav: true,
});

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "persijakafe.dev.accolaplay.id" },
      { hostname: "cdn.dev.accolaplay.id" },
      {
        protocol: "https",
        hostname: "cdn.dev.accolaplay.id",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "persijakafe.dev.accolaplay.id",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cdn.dev.accolaplay.id",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "persijakafe.dev.accolaplay.id",
        pathname: "/**",
      },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
      { hostname: "192.168.1.10" },
      { hostname: "lh3.googleusercontent.com" },
    ],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
