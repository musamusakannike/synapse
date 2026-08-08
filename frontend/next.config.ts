import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
