import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Matches the Cloudflare R2 public bucket URL pattern (server/.env R2_PUBLIC_URL).
    // Uses a wildcard so a bucket ID rotation doesn't silently break next/image.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        // Firebase's signInWithPopup needs to poll window.closed on the
        // popup it opens; a same-origin COOP policy (Next.js/host default)
        // silently blocks that check and breaks Google sign-in.
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
