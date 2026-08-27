"use client";

import { Info } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { getDisplayName } from "@/lib/utils";

/**
 * The signed-in user's actual identity.
 *
 * Everything here previously came from literals — "Kwame Ofori",
 * "EcoLogic Systems SA", "ACCRA, GHANA", "USR-ADM-8492" — inside editable
 * inputs above a Save button with no handler. Whoever opened this page saw
 * someone else's name presented as their own, and could type over it with no
 * effect.
 *
 * Read-only on purpose. There is no write path for these fields yet: the
 * frontend's UserService.updateUserProfile PUTs to /users, and the backend
 * only serves GET /users/role and GET /users/:id — no PUT exists. better-auth's
 * own update-user would only cover name/image here, since firstName,
 * lastName, contactNumber and countryOfOperation are not declared as
 * additionalFields in its config. An input that discards what you type is
 * worse than a field that says it cannot be edited here.
 */

function Field({
  label,
  value,
  mono,
  hint,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  hint?: string;
}) {
  const missing = !value;

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div
        className={`w-full bg-slate-50 border border-slate-200 p-4 rounded-none ${
          mono
            ? "font-mono text-xs tracking-widest uppercase"
            : "font-sans text-sm font-bold"
        } ${missing ? "text-slate-400 italic" : "text-slate-900 select-all"}`}
      >
        {/* An empty field says it is empty. It does not borrow a plausible
            value to look complete. */}
        {value || "Not provided"}
      </div>
      {hint && (
        <p className="text-[10px] font-mono text-slate-400 tracking-wide">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ProfileSection({ isCorporate }: { isCorporate: boolean }) {
  const { user, isPending } = useUser();

  if (isPending) {
    return (
      <div className="py-16 text-center font-mono text-[10px] uppercase tracking-widest text-slate-400">
        Loading your profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 border border-amber-200 bg-amber-50 rounded-none">
        <p className="text-sm font-bold text-amber-900">
          Your profile could not be loaded
        </p>
        <p className="text-xs text-amber-700 mt-1 font-mono">
          This is a session problem, not an empty profile. Try signing out and
          back in.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-sans text-slate-900 mb-2">
          {isCorporate ? "Entity Profile." : "Identity Dossier."}
        </h2>
        <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
          Registration details held against your account.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Legal Name" value={getDisplayName(user, "")} />
          <Field label="Email Address" value={user.email} mono />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Contact Number" value={user.contactNumber} mono />
          <Field
            label="Country of Operation"
            value={user.countryOfOperation}
            mono
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field
            label="Clearance Level"
            value={user.role?.replace(/_/g, " ")}
            mono
            hint="Assigned by an administrator. Changed in User Management."
          />
          <Field
            label="Email Verified"
            value={user.emailVerified ? "Verified" : "Not verified"}
            mono
          />
        </div>

        <Field
          label="System Identifier"
          value={user.id}
          mono
          hint="Quote this when reporting an issue with your account."
        />

        {user.activeOrganizationId && (
          <Field
            label="Organization Identifier"
            value={user.activeOrganizationId}
            mono
          />
        )}
      </div>

      <div className="pt-8 border-t border-slate-200 flex gap-3 items-start">
        <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 leading-relaxed">
          These details are read-only here. Your name and contact details are
          captured at registration; your clearance level is set by an
          administrator. Editing from this screen is not wired up yet — when it
          is, this note goes away rather than a Save button quietly doing
          nothing.
        </p>
      </div>
    </div>
  );
}
