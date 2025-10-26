import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para static export (sem API routes)
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Desabilitar features que não funcionam com static export
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
