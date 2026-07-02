import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //Add optimizePackageImports to your next.config to force Next.js to tree-shake specific heavy UI or utility libraries
  experimental: {
    optimizePackageImports: ["lucide-react", "@hugeicons/react"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
    unoptimized: true,
  },

  // Proxy /api/auth/* and /api/v*/* through Next.js so that:
  //  1. Auth cookies are set same-origin (netlify.app → netlify.app), not
  //     cross-origin to Render. httpOnly cookies cannot be set cross-origin.
  //  2. CORS preflight is avoided for all API calls.
  //  3. BETTER_AUTH_URL on the backend can stay as the frontend URL.
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/:path*`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
      {
        source: "/api/v2/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v2/:path*`,
      },
    ];
  },
};

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
