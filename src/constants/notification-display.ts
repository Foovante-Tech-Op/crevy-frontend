import {
  Activity,
  BadgeCheck,
  Banknote,
  Bell,
  Leaf,
  Radar,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import type { TNotificationType } from "@/types/notification.types";

/**
 * Presentation for a notification `type`, resolved on the client.
 *
 * The API sends a category string and nothing else — no icon component, no
 * Tailwind classes. Same arrangement as ACTIVITY_ICONS for the dashboard
 * activity feed. The mock page this replaced stored a Lucide component and a
 * className string inside each notification object, which meant presentation
 * could never have come from a server.
 */

export const NOTIFICATION_ICONS: Record<TNotificationType, React.ElementType> =
  {
    access: UserPlus,
    developer: BadgeCheck,
    project: Leaf,
    mrv: Radar,
    credit: ShieldCheck,
    finance: Banknote,
    compliance: Activity,
    system: Bell,
  };

export const NOTIFICATION_STYLES: Record<TNotificationType, string> = {
  access: "text-sky-600 bg-sky-50",
  developer: "text-indigo-600 bg-indigo-50",
  project: "text-brand-500 bg-brand-50",
  mrv: "text-amber-600 bg-amber-50",
  credit: "text-emerald-600 bg-emerald-50",
  finance: "text-violet-600 bg-violet-50",
  compliance: "text-purple-600 bg-purple-50",
  system: "text-slate-500 bg-slate-100",
};

/** Fallbacks, so a type the client doesn't know yet still renders. */
export const NOTIFICATION_ICON_FALLBACK = Bell;
export const NOTIFICATION_STYLE_FALLBACK = "text-slate-500 bg-slate-100";

export const getNotificationIcon = (type: string): React.ElementType =>
  NOTIFICATION_ICONS[type as TNotificationType] ?? NOTIFICATION_ICON_FALLBACK;

export const getNotificationStyle = (type: string): string =>
  NOTIFICATION_STYLES[type as TNotificationType] ?? NOTIFICATION_STYLE_FALLBACK;

/**
 * The filter tabs on /notifications.
 *
 * `value` is either a sentinel handled by the page, or a real `type` sent
 * straight through as a query param — so these must stay in step with
 * TNotificationType.
 */
export const NOTIFICATION_FILTERS = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Projects", value: "project" },
  { label: "MRV", value: "mrv" },
  { label: "Finance", value: "finance" },
  { label: "System", value: "system" },
] as const;

export type TNotificationFilterValue =
  (typeof NOTIFICATION_FILTERS)[number]["value"];
