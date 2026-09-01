import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // O padrão do Next.js para o corpo de uma Server Action é 1MB, o que é
  // pequeno demais para fotos tiradas direto do celular (escudos e fotos
  // de jogador). Aumentamos para 10MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;