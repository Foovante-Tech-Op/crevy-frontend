// src/lib/errors.ts
//
// One place that turns anything thrown — an axios rejection, a better-auth
// error context, a DOMException, a bare string — into a sentence we are willing
// to show a user.
//
// WHY THIS EXISTS
//
// The backend's production error handler returns `err.message` verbatim for
// non-operational errors too (crevy-backend src/shared/errors/errorHandler.ts:
// `message: err.message || "Internal Server Error"`). So a Drizzle/Postgres
// failure — `duplicate key value violates unique constraint "users_email_idx"`
// — reaches the browser as a plain string. Call sites that did
// `error?.response?.data?.message || "Failed to save"` printed that straight
// into a toast: unreadable for the user, and it leaks schema names.
//
// Three layers, in order:
//   1. Transport   — offline / timeout / cancelled never reach the status map.
//   2. Translation — backend strings we know about, rewritten (BACKEND_MESSAGES).
//   3. Judgement   — anything left is shown only if it reads like a sentence
//                    written for a human (looksPresentable), else the caller's
//                    fallback or the HTTP status default.
//
// The fallback is a required argument on purpose. A generic "Something went
// wrong" tells the user nothing about what to retry; the call site is the only
// place that knows it was a profile save rather than a file upload.

import { isAxiosError } from "axios";

/** Last-resort text when a call site has nothing better and no status matched. */
export const GENERIC_ERROR = "Something went wrong. Please try again.";

// ─── Layer 1: transport ─────────────────────────────────────────────────────
// These never carry a usable HTTP status, and the browser's own text for them
// ("Network Error", "timeout of 0ms exceeded") is meaningless to a user.

const OFFLINE =
  "You appear to be offline. Check your connection and try again.";
const TIMEOUT = "That took too long to respond. Please try again.";

// ─── Layer 2: HTTP status defaults ──────────────────────────────────────────
// Used when the backend said nothing useful. Deliberately plain, and phrased so
// the user knows whether to retry, fix something, or give up.

const STATUS_MESSAGES: Record<number, string> = {
  400: "Some of the details you entered aren't valid. Please check them and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  405: "That action isn't available.",
  408: TIMEOUT,
  409: "That conflicts with something that already exists.",
  413: "That file is too large.",
  415: "That file type isn't supported.",
  422: "Some of the details you entered aren't valid. Please check them and try again.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again in a moment.",
  502: "We're having trouble reaching the server. Please try again in a moment.",
  503: "The service is temporarily unavailable. Please try again in a moment.",
  504: TIMEOUT,
};

// ─── Layer 2b: known backend strings ────────────────────────────────────────
// Keys are matched case-insensitively with surrounding punctuation stripped, so
// "User not found" and "user not found." both hit the same entry.
//
// Only list strings worth rewriting: internal field names ("userId is
// mandatory"), domain jargon a user has never seen ("dMRV provider partner
// record"), or text too vague to act on. A backend message that is already a
// good sentence — "An account with this email already exists" — needs no entry;
// layer 3 will pass it through unchanged.

const BACKEND_MESSAGES: Record<string, string> = {
  // Internal field names leaking into user-facing copy.
  "userid is mandatory":
    "We couldn't identify your account. Please sign in again.",
  "orgname is mandatory": "Please enter an organisation name.",
  "netcreditsissued must be greater than zero":
    "Credits issued must be greater than zero.",
  "target project profile context missing":
    "We couldn't tell which project this belongs to. Please reopen it and try again.",

  // Too vague to act on.
  "account creation failed unexpectedly":
    "We couldn't create the account. Please try again, or contact support if it keeps happening.",
  "failed to create user account":
    "We couldn't create the account. Please try again, or contact support if it keeps happening.",
  "registration failed. please try again":
    "We couldn't complete your registration. Please try again.",
  "resource not found or access denied":
    "We couldn't find that, or you don't have access to it.",
  forbidden: "You don't have permission to do that.",

  // Domain jargon.
  "no dmrv provider partner record found":
    "This account isn't set up as a verification partner yet. Please contact support.",

  // Fine already, but phrased more helpfully with the next step included.
  "invalid or expired invitation token":
    "This invitation link has expired or has already been used. Please ask for a new one.",
  "invalid verification token":
    "This verification link has expired or has already been used. Please request a new one.",
  "invalid or expired code":
    "That code is incorrect or has expired. Please check it, or request a new one.",
  "failed to send verification email":
    "We couldn't send the verification email. Please try again in a moment.",
  "failed to generate upload url":
    "We couldn't start the upload. Please try again.",
  "failed to upload report to storage":
    "We couldn't upload that file. Please try again.",
};

// ─── Layer 3: is this fit to show a human? ──────────────────────────────────
// Anything matching these is machine output, not a message. The cost of being
// wrong is asymmetric: hiding a usable message costs the user a little
// specificity, while showing a stack trace or a constraint name costs us
// legibility and leaks the schema.

const TECHNICAL_PATTERNS: RegExp[] = [
  /duplicate key value|violates .*constraint|relation ".*" does not exist/i,
  /\b(select\s+.*\s+from|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i,
  /\bat\s+.*\(.*:\d+:\d+\)/, // stack frame
  /\b(econnrefused|etimedout|enotfound|econnreset|eai_again)\b/i,
  /\b(drizzle|postgres|postgresql|pg_|sequelize|prisma)\b/i,
  /\b(undefined|null|NaN)\b/,
  /^[A-Za-z]*Error:/, // "TypeError: ...", "Error: ..."
  /\bcannot read propert(y|ies)\b/i,
  /<\/?[a-z][\s\S]*>/i, // an HTML error page
  /\{[\s\S]*\}|\[[\s\S]*\]/, // serialised JSON
];

// A unique-constraint violation is the one database error worth translating
// rather than hiding. It is almost always the user re-entering something that
// already exists — a phone number, an email — and "Something went wrong on our
// end" wrongly implies it is our fault and that retrying might work.
//
// This is a safety net, not the fix. The backend should return a 409 with a
// proper message; where it does, that message wins and this never runs. It
// exists because the production handler forwards raw driver text (a field agent
// hit exactly this: an entire INSERT statement rendered in a toast).
const UNIQUE_VIOLATION =
  /duplicate key value|violates unique constraint|unique_violation/i;

const CONSTRAINT_FIELD_HINTS: [RegExp, string][] = [
  [/phone/i, "That phone number is already registered."],
  [/email/i, "That email address is already registered."],
  [/\bcode\b/i, "That code is already in use."],
  [/\bname\b/i, "That name is already taken."],
];

function fromUniqueViolation(raw: string): string | null {
  if (!UNIQUE_VIOLATION.test(raw)) return null;
  for (const [pattern, message] of CONSTRAINT_FIELD_HINTS) {
    if (pattern.test(raw)) return message;
  }
  return "Some of these details are already registered to someone else.";
}

function looksPresentable(text: string): boolean {
  const t = text.trim();
  if (t.length < 3 || t.length > 160) return false;
  if (t.includes("\n")) return false;
  // snake_case / camelCase identifiers are field names, not prose.
  if (/\b[a-z]+_[a-z]+\b/.test(t)) return false;
  if (/\b[a-z]+[A-Z][a-zA-Z]*\b/.test(t)) return false;
  return !TECHNICAL_PATTERNS.some((re) => re.test(t));
}

function normalizeKey(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.!]+$/, "");
}

/**
 * Translate a raw backend string, or return null if it should not be shown.
 *
 * `allowHeuristic` gates only layer 3. On a 5xx the backend has thrown, so its
 * message is the one most likely to be raw driver output and unknown strings
 * are dropped — but the curated map is still consulted, because several
 * AppErrors that ARE user-facing are thrown with a 500
 * ("Failed to send verification email").
 */
function fromBackendMessage(
  raw: unknown,
  { allowHeuristic = true }: { allowHeuristic?: boolean } = {},
): string | null {
  if (typeof raw !== "string") return null;
  const mapped = BACKEND_MESSAGES[normalizeKey(raw)];
  if (mapped) return mapped;
  // Before the technical filter drops it: a constraint violation carries real
  // information for the user, even though the text around it is unshowable.
  const duplicate = fromUniqueViolation(raw);
  if (duplicate) return duplicate;
  if (!allowHeuristic) return null;
  return looksPresentable(raw) ? raw.trim() : null;
}

/**
 * Turn anything thrown into a sentence worth showing a user.
 *
 * @param error    whatever was caught
 * @param fallback what to say when nothing better can be determined — describe
 *                 the action that failed, e.g. "We couldn't save your profile."
 */
export function getErrorMessage(
  error: unknown,
  fallback = GENERIC_ERROR,
): string {
  if (!error) return fallback;

  if (isAxiosError(error)) {
    // Layer 1. `response` is absent when the request never completed, which is
    // a different failure from any status code and needs different advice.
    if (error.code === "ERR_CANCELED") return fallback;
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
      return TIMEOUT;
    if (!error.response) {
      return typeof navigator !== "undefined" && navigator.onLine === false
        ? OFFLINE
        : "We couldn't reach the server. Please check your connection and try again.";
    }

    const status = error.response.status;
    const data = error.response.data as { message?: unknown } | undefined;

    const translated = fromBackendMessage(data?.message, {
      allowHeuristic: status < 500,
    });
    if (translated) return translated;
    return STATUS_MESSAGES[status] ?? fallback;
  }

  // better-auth hands the client `ctx.error` — a plain object with `message`
  // and sometimes `status` — rather than an axios error.
  if (typeof error === "object") {
    const e = error as { message?: unknown; status?: unknown; code?: unknown };
    if (typeof e.status === "number" && STATUS_MESSAGES[e.status]) {
      const translated = fromBackendMessage(e.message);
      return translated ?? STATUS_MESSAGES[e.status];
    }
    const translated = fromBackendMessage(e.message);
    if (translated) return translated;
  }

  if (typeof error === "string") {
    return fromBackendMessage(error) ?? fallback;
  }

  return fallback;
}

/**
 * The backend's raw message, for PROGRAMMATIC inspection only.
 *
 * NEVER render this — that is what getErrorMessage is for. It exists because a
 * couple of flows branch on the message's content rather than just showing it:
 * AssessmentModuleStep parses the field list out of
 * "missing required fields: siteArea, ownerName". Those strings are full of
 * camelCase identifiers, so getErrorMessage correctly refuses to display them —
 * which would silently break the parse if the branch used it.
 */
export function getRawErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  if (error && typeof error === "object") {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return typeof error === "string" ? error : "";
}

/**
 * Field-level message for a Zod issue, for use in a toast rather than inline on
 * the input. Turns `contactEmail` into "Contact email" so the user is looking
 * for a label they can actually see on screen.
 */
export function getFieldErrorMessage(field: string, message?: string): string {
  const label = field
    .replace(/[._]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  const readable = label.charAt(0).toUpperCase() + label.slice(1);
  return message ? `${readable}: ${message}` : `${readable} isn't valid.`;
}
