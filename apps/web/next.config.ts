import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Since we are using Cloudflare Pages, we might want to export static if not using SSR
  // But App Router allows SSR via Pages if configured.
};

export default nextConfig;
