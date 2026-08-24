import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

/**
 * Display-name helpers.
 *
 * `user.name` is a denormalised column better-auth writes once at sign-up
 * (`${firstName} ${lastName}`). Nothing keeps it in sync afterwards, so an
 * account whose first/last name changed later — or one created by the
 * `seed-super-admin` script and then re-used by a real person — still carries
 * the original string. `firstName`/`lastName` are the columns the profile
 * screen reads and writes, so treat them as the source of truth and fall back
 * to `name` only when they are absent.
 */
type TNamedUser =
  | {
      name?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    }
  | null
  | undefined;

export function getDisplayName(user: TNamedUser, fallback = "User") {
  const composed = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return composed || user?.name?.trim() || fallback;
}

export function getFirstName(user: TNamedUser, fallback = "User") {
  return (
    user?.firstName?.trim() || getDisplayName(user, fallback).split(" ")[0]
  );
}

export function getUserInitials(user: TNamedUser) {
  const name = getDisplayName(user, "");
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
