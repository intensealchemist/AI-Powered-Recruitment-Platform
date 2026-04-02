import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev }) {
    if (dev) {
      config.cache = { type: "memory" };
    }

    return config;
  },
};

export default nextConfig;
