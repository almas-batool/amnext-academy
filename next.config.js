// ─────────────────────────────────────────────────────────────
//  next.config.js
// ─────────────────────────────────────────────────────────────
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com"           },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com"   },
      { protocol: "https", hostname: "**.cloudflare.com"             },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com"     },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  webpack: (config) => {
    // Prevents canvas (PDF.js dependency) from breaking SSR
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
