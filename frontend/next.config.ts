import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Suppresses the "multiple lockfiles" warning caused by monorepo structure
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    // Limit parallel compilation workers to reduce peak memory usage
    cpus: 1,
  },
};

export default nextConfig;
