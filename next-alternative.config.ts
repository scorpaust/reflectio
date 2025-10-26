import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para static export (sem API routes)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
