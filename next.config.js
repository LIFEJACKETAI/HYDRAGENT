/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverBodySizeLimit: 900000,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
