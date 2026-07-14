import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Auth Middleware - Email Verification Soft Gate
 *
 * Protects routes by checking is_verified status:
 * - Unverified users can only access: /verify-email, /auth/*, /api/auth/*
 * - All other routes redirect to /verify-email
 *
 * This follows the industry standard pattern (Slack, GitHub, Discord)
 * to handle email typos gracefully while maintaining security.
 */

// Routes that don't require verification
const PUBLIC_ROUTES = [
  "/",
  "/register",
  "/register-interest",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/auth/change-email",
  "/marketplace",
  "/methodology",
  "/public-registry",
  "/about-us",
  "/support",
  "/privacy-policy",
  "/terms-of-service",
  "/data-processing-agreement",
];

// Routes that require authentication (but not necessarily verification)
const _AUTHENTICATED_ROUTES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/organizations",
  "/projects",
  "/credits",
  "/portfolio",
  "/analytics",
  "/compliance",
  "/financials",
  "/notifications",
  "/data-collection",
  "/site-visits",
  "/track-verification",
  "/user-management",
  "/carbon-calculator",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("session")?.value;

  // If no session, allow public routes
  if (!sessionToken) {
    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User has a session - verify it and check is_verified status
  try {
    const sessionResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/get-session`,
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
        cache: "no-store",
      },
    );

    if (!sessionResponse.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { session } = await sessionResponse.json();

    // No session data
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const user = session.user;
    const isVerified = user.isVerified ?? true; // Default to true if not present (backward compat)

    // Allow access to verify-email page and auth routes
    if (
      pathname === "/verify-email" ||
      pathname.startsWith("/auth/change-email") ||
      pathname.startsWith("/api/auth/")
    ) {
      return NextResponse.next();
    }

    // If not verified, redirect to verify-email page
    if (!isVerified) {
      // Don't redirect if already on verify-email page
      if (pathname !== "/verify-email") {
        // Preserve the intended destination for post-verification redirect
        const verifyUrl = new URL("/verify-email", request.url);
        verifyUrl.searchParams.set("email", user.email || "");
        verifyUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(verifyUrl);
      }
    }

    // User is verified, allow access
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request to proceed
    return NextResponse.next();
  }
}

function isPublicRoute(pathname: string): boolean {
  // Exact matches
  if (PUBLIC_ROUTES.some((route) => route === pathname)) {
    return true;
  }

  // Prefix matches for auth routes
  if (pathname.startsWith("/auth/")) {
    return true;
  }

  // Allow static files and public assets
  if (
    pathname.startsWith("/public/") ||
    pathname.includes(".") // has file extension
  ) {
    return true;
  }

  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
