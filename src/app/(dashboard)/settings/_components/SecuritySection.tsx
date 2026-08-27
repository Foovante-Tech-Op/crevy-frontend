"use client";

import { formatDistanceToNow } from "date-fns";
import { Key, Loader2, ShieldCheck, X } from "lucide-react";
import {
  describeUserAgent,
  useRevokeOtherSessions,
  useRevokeSession,
  useSessions,
} from "@/hooks/use-account";
import { useUser } from "@/hooks/use-user";

/**
 * Account security.
 *
 * What this replaced was invented end to end: MFA shown as active with a
 * "Disable Protocol" button, and two hardcoded devices — "Mac OS / Chrome
 * WebKit, IP 197.251.x.x, ACCRA, GH (CURRENT)" and "iOS / Safari Mobile,
 * IP 154.160.x.x, LONDON, UK" — with a revoke control that did nothing.
 *
 * Both halves were dangerous in opposite directions. Telling someone MFA
 * guards their account when no MFA exists invites them to relax a real
 * precaution. Showing a foreign device nobody can actually sign out invites
 * a panic with no remedy.
 *
 * Sessions are now real (better-auth /list-sessions, /revoke-session,
 * /revoke-other-sessions). MFA is reported as what it is: absent.
 */

const relative = (iso: string) => {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

export function SecuritySection() {
  const { session } = useUser();
  const { data: sessions = [], isLoading, isError } = useSessions();
  const revoke = useRevokeSession();
  const revokeOthers = useRevokeOtherSessions();

  const currentToken = (session?.session as { token?: string } | undefined)
    ?.token;

  // Newest first, with the current device pinned to the top — it is the one
  // people look for to orient themselves before judging the rest.
  const ordered = [...sessions].sort((a, b) => {
    if (a.token === currentToken) return -1;
    if (b.token === currentToken) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const otherCount = ordered.filter((s) => s.token !== currentToken).length;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-sans text-slate-900 mb-2">
          Access & Security.
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          Where your account is signed in, and how it is protected.
        </p>
      </div>

      <div className="grid gap-8">
        {/* ── MFA: stated honestly, with no control behind it ── */}
        <div className="p-8 border border-slate-200 bg-white rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-none flex items-center justify-center shrink-0">
              <Key size={16} className="text-slate-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">
                Multi-Factor Authentication
              </h4>
              <p className="text-xs font-mono text-slate-500 leading-relaxed">
                Not available on Crevy yet. Your account is protected by your
                password alone — use a strong, unique one.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-none text-[10px] font-bold uppercase tracking-widest shrink-0">
            Not configured
          </span>
        </div>

        {/* ── Sessions: real ── */}
        <div className="border border-slate-200 bg-white rounded-none">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
              Active Sessions
            </h4>
            {otherCount > 0 && (
              <button
                type="button"
                onClick={() => revokeOthers.mutate()}
                disabled={revokeOthers.isPending}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors disabled:opacity-40"
              >
                {revokeOthers.isPending
                  ? "Signing out..."
                  : `Sign out ${otherCount} other device${otherCount === 1 ? "" : "s"}`}
              </button>
            )}
          </div>

          {isLoading && (
            <p className="p-6 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              Loading sessions...
            </p>
          )}

          {/* A failed fetch must not read as "you are signed in nowhere else",
              which is the reassuring answer and possibly the wrong one. */}
          {isError && (
            <p className="p-6 text-center font-mono text-[10px] uppercase tracking-widest text-amber-600">
              Sessions could not be loaded — this is not a confirmation that
              there are none
            </p>
          )}

          {!isLoading && !isError && ordered.length === 0 && (
            <p className="p-6 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
              No active sessions found
            </p>
          )}

          <div className="divide-y divide-slate-100">
            {ordered.map((s) => {
              const isCurrent = s.token === currentToken;
              return (
                <div
                  key={s.id}
                  className="flex justify-between items-center gap-4 p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="font-sans text-sm font-bold text-slate-900 mb-1">
                      {describeUserAgent(s.userAgent)}
                      {isCurrent && (
                        <span className="ml-2 text-[9px] font-mono uppercase tracking-widest text-brand-600">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 tracking-widest truncate">
                      {/* Only what the server actually recorded. No invented
                          city — an IP is not a location. */}
                      {s.ipAddress ? `IP ${s.ipAddress}` : "IP not recorded"}
                      {s.createdAt
                        ? ` · signed in ${relative(s.createdAt)}`
                        : ""}
                    </div>
                  </div>

                  {isCurrent ? (
                    <ShieldCheck
                      size={18}
                      className="text-brand-600 shrink-0"
                      aria-label="Current session"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => revoke.mutate(s.token)}
                      disabled={revoke.isPending}
                      aria-label="Sign out this device"
                      className="p-2 border border-slate-200 rounded-none text-slate-400 hover:text-red-600 hover:border-red-600 transition-colors shrink-0 disabled:opacity-40"
                    >
                      {revoke.isPending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <X size={14} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
