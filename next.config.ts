import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverBodySizeLimit: 900000,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;