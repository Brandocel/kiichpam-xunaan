import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [72, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kiichpam-xunaan.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kiichpam-api-jpuw6.ondigitalocean.app",
        pathname: "/media/file/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico|mp4|webm)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;