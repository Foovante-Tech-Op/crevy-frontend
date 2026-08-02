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

  // Security headers. Lighthouse (best-practices-trust-safety) flags missing
  // HSTS / COOP / clickjacking mitigation / CSP on every request, so these
  // apply globally rather than per-route.
  //
  // The CSP below is intentionally permissive on script-src ('unsafe-inline'
  // 'unsafe-eval') because Next.js's App Router hydration relies on inline
  // bootstrap scripts and we haven't wired up per-request nonces yet —
  // tightening that requires a middleware-based nonce, which is a separate
  // follow-up. Everything else here is scoped to what the app actually loads:
  // Cloudinary for hero/section videos, and same-origin for the API rewrite.
  async headers() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL || "";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://images.pexels.com https://picsum.photos",
      "media-src 'self' https://res.cloudinary.com",
      "font-src 'self' data:",
      `connect-src 'self' https://res.cloudinary.com ${apiOrigin}`.trim(),
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
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
