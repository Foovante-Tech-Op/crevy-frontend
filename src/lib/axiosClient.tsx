// src/lib/axiosClient.tsx
import axios from "axios";

const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || "v2";

// 1. Determine the correct Base URL depending on the environment
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // IN BROWSER: Use relative path.
    // This forces Axios to call https://crevyfront.curiousfellow.top/api/v2/...
    // Your Next.js rewrites will then securely proxy it to Render WITH the Lax cookie.
    return "";
  }
  // ON SERVER (SSR): Next.js requires an absolute URL to fetch.
  return process.env.NEXT_PUBLIC_API_URL;
};

export const axiosClient = axios.create({
  baseURL: `${getBaseUrl()}/api/${apiVersion}`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: Attach Headers during SSR
axiosClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") {
    try {
      const { headers } = await import("next/headers");
      const headersList = await headers();

      // --- CRITICAL FIX: FORWARD THE COOKIE ---
      const cookie = headersList.get("cookie");
      if (cookie) {
        config.headers.Cookie = cookie;
      }

      // Forward User-Agent
      const userAgent = headersList.get("user-agent");
      if (userAgent) {
        config.headers["User-Agent"] = userAgent;
      }

      // Forward IP for Arcjet
      const clientIp =
        headersList.get("cf-connecting-ip") ||
        headersList.get("x-forwarded-for");

      if (clientIp) {
        config.headers["X-Forwarded-For"] = clientIp;
      }
    } catch (error) {
      console.warn("Could not attach server headers:", error);
    }
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    throw error;
  },
);
