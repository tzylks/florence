import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "http://localhost:5001/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
