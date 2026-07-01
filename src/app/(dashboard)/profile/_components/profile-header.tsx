"use client";

import { Building2, Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProfileHeaderProps {
  user: any;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const _router = useRouter();
  if (!user) return null;

  const initials =
    `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() ||
    "ID";
  const _isSuperAdmin = user.role === "super_admin";

  return (
    <div className="bg-slate-900 border border-slate-900 text-white relative overflow-hidden group">
      {/* Abstract Institutional Watermark */}
      <div className="absolute -right-20 -bottom-20 text-slate-800 pointer-events-none opacity-50 group-hover:scale-105 transition-transform duration-1000">
        {user.role === "financial_admin" ? (
          <Building2 size={300} strokeWidth={0.5} />
        ) : (
          <UserIcon size={300} strokeWidth={0.5} />
        )}
      </div>

      <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
        <div className="h-24 w-24 md:h-32 md:w-32 bg-white text-slate-900 flex items-center justify-center font-serif text-4xl md:text-5xl shrink-0">
          {initials}
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
              {user.role === "financial_admin" ? (
                <Building2 className="w-3 h-3" />
              ) : (
                <UserIcon className="w-3 h-3" />
              )}
              {user.role?.replace(/_/g, " ") || "Unassigned Entity"}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif tracking-tight leading-none mb-2">
              {user.firstName}{" "}
              <span className="italic text-slate-400">{user.lastName}.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-6 text-[11px] font-mono uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-emerald-500" /> {user.email}
            </span>
            {user.phoneNumber && (
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />{" "}
                {user.phoneNumber}
              </span>
            )}
            {user.countryOfOperation && (
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />{" "}
                {user.countryOfOperation}
              </span>
            )}
          </div>

          {(user.company?.legalBusinessName ||
            user.projectOwner?.projectCategory) && (
            <div className="pt-4 mt-4 border-t border-slate-800 grid grid-cols-2 gap-4 max-w-lg">
              {user.company?.legalBusinessName && (
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Registered Entity
                  </p>
                  <p className="font-mono text-sm text-white">
                    {user.company.legalBusinessName}
                  </p>
                </div>
              )}
              {user.projectOwner?.projectCategory && (
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Asset Category
                  </p>
                  <p className="font-mono text-sm text-white">
                    {user.projectOwner.projectCategory}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
