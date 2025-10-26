import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração mínima para Netlify
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
