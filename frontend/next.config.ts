import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Limit parallel compilation workers to reduce peak memory on low-RAM machines
    cpus: 1,
  },
};

export default nextConfig;
