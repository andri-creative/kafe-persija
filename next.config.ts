import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "localhost",
      "127.0.0.1",
      "192.168.1.10",
      "lh3.googleusercontent.com",
    ],
  },
};

export default nextConfig;
