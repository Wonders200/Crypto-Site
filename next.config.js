/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,          // faster dev renders
  swcMinify: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
    ],
    serverComponentsExternalPackages: ["bcryptjs", "jsonwebtoken"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Speed up dev: don't run eslint/ts on every request
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};
module.exports = nextConfig;