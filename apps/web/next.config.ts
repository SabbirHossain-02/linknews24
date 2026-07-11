import type { NextConfig } from "next";

// Article/e-paper images are served by the API on the same VPS. Allow the
// Next image optimizer to fetch + convert them (to WebP/AVIF) by deriving the
// host from the same env var the client uses.
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://144.79.249.242:4100";
const api = new URL(apiUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: api.protocol.replace(":", "") as "http" | "https",
        hostname: api.hostname,
        port: api.port || undefined,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
