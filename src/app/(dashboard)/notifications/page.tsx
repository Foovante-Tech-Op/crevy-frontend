"use client";

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "New Asset Acquisition",
      message:
        "1,240 tCO2e has been added to your institutional portfolio from the Volta Basin project.",
      time: "2 mins ago",
      read: false,
      icon: Zap,
      color: "text-brand-500 bg-brand-50",
    },
    {
      id: 2,
      type: "system",
      title: "KYB Verification Finalized",
      message:
        "Your corporate identity proofs have been anchored on the Polygon registry.",
      time: "1 hour ago",
      read: true,
      icon: ShieldCheck,
      color: "text-blue-500 bg-blue-50",
    },
    {
      id: 3,
      type: "compliance",
      title: "Q1 ESG Report Ready",
      message:
        "The automated impact assessment for the previous quarter is now available for download.",
      time: "3 hours ago",
      read: true,
      icon: CheckCircle2,
      color: "text-purple-500 bg-purple-50",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="max-w-2xl">
          <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Bell size={14} /> Institutional Alert Registry
          </p>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
            Command <br /> Center Notifications
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {["All", "Unread", "Compliance", "System"].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFilter(t.toLowerCase())}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t.toLowerCase()
                    ? "bg-slate-900 text-white shadow-lg"
                    : "bg-white border border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-600"
          >
            Mark all as read
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`group p-8 rounded-[2rem] border transition-all flex gap-8 items-start cursor-pointer hover:shadow-xl ${
                n.read
                  ? "bg-white border-slate-100"
                  : "bg-white border-brand-200 shadow-lg shadow-brand-900/5 ring-1 ring-brand-100"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-50 ${n.color}`}
              >
                <n.icon size={28} />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <h3
                    className={`font-black uppercase tracking-tight text-lg ${n.read ? "text-slate-700" : "text-slate-900"}`}
                  >
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </div>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {n.message}
                </p>
                <div className="pt-4 flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock size={12} /> {n.time}
                  </span>
                  <span className="flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                    Details <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-12 text-center border-t border-slate-100 italic">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Historical system messages archived in repository.
          </p>
        </div>
      </div>
    </div>
  );
}
