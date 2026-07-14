import { headers } from "next/headers";

export const getServerSession = async () => {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  // No cookie = definitely no session, skip the network call entirely.
  if (!cookie) return null;

  // Use NEXT_PUBLIC_SITE_URL if set (production), otherwise fall back to the
  // internal rewrite path which works in both Vercel and CF Pages because
  // the rewrite proxy is same-origin. We must use an absolute URL for
  // server-side fetch — relative URLs are not supported in Node/Edge fetch.
  //
  // Priority:
  //   1. SITE_URL      — server-only var, set this in Render/CF/Vercel env
  //   2. NEXT_PUBLIC_APP_URL — fallback, works if set
  //   3. NEXT_PUBLIC_SITE_URL — last resort (NEXT_PUBLIC_ vars are browser-
  //      injected and may be undefined during SSR on some runtimes)
  const siteUrl =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    console.error(
      "[getServerSession] No site URL env var found. " +
        "Set SITE_URL (server-only) in your deployment environment.",
    );
    return null;
  }

  const proxyUrl = `${siteUrl}/api/auth/get-session`;

  // Hard timeout — never let a slow Render cold-start block SSR for >8s.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(proxyUrl, {
      headers: { cookie },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();

    // The response could be { session: { user: ... } } or directly { user: ... }
    if (data?.session) {
      return data;
    }

    if (data?.user) {
      // Mock the session structure to keep the layout code happy if it expects .session
      return { session: data, user: data.user, ...data };
    }

    return null;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error("[getServerSession] Timed out after 8s fetching session.");
    } else {
      console.error("[getServerSession] Fetch failed:", err);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
