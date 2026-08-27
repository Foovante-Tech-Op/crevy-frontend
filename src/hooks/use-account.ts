"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/lib/errors";

/**
 * Account security data, straight from better-auth.
 *
 * /list-sessions, /revoke-session and /revoke-sessions are core better-auth
 * routes — no plugin needed — so these are real, unlike the two invented
 * devices this replaced ("Mac OS / Chrome WebKit, ACCRA, GH" and
 * "iOS / Safari Mobile, LONDON, UK", both with made-up IPs).
 *
 * There is deliberately no MFA hook here. The backend registers only
 * openAPI(), username() and customSession() (crevy-backend
 * src/shared/utils/auth.ts) — the twoFactor() plugin is not enabled and no
 * 2FA tables exist, so there is nothing to query. The settings UI says so
 * plainly rather than rendering a control for a protection that isn't there.
 */

export interface TAuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const SESSIONS_KEY = ["auth", "sessions"] as const;

export function useSessions() {
  return useQuery<TAuthSession[]>({
    queryKey: SESSIONS_KEY,
    queryFn: async () => {
      const { data, error } = await authClient.listSessions();
      if (error) throw new Error(error.message ?? "Could not load sessions.");
      return (data ?? []) as unknown as TAuthSession[];
    },
    staleTime: 30_000,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token });
      if (error)
        throw new Error(error.message ?? "Could not sign out that device.");
    },
    onSuccess: () => {
      toast.success("That device has been signed out.");
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't sign that device out. Please try again.",
        ),
      );
    },
  });
}

/**
 * Revokes every session except the one making the request — better-auth's
 * /revoke-sessions keeps the caller signed in, so this cannot lock someone
 * out of the page they are standing on.
 */
export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error)
        throw new Error(error.message ?? "Could not sign out other devices.");
    },
    onSuccess: () => {
      toast.success("All other devices have been signed out.");
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: (err) => {
      toast.error(
        getErrorMessage(
          err,
          "We couldn't sign the other devices out. Please try again.",
        ),
      );
    },
  });
}

/**
 * Turns a raw User-Agent into something a person can recognise on a
 * "is this me?" screen. Deliberately coarse: browser + OS is enough to spot
 * a device you don't own, and anything more precise would be guesswork
 * dressed up as fact.
 */
export function describeUserAgent(ua?: string | null): string {
  if (!ua) return "Unknown device";

  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /safari/i.test(ua)
            ? "Safari"
            : "Unknown browser";

  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /mac os x|macintosh/i.test(ua)
        ? "macOS"
        : /windows/i.test(ua)
          ? "Windows"
          : /linux/i.test(ua)
            ? "Linux"
            : "Unknown OS";

  return `${os} · ${browser}`;
}
