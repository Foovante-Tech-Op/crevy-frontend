"use client";

import {
  Building2,
  CheckCircle2,
  Globe,
  Info,
  Mail,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrganizationPage() {
  const orgData = {
    name: "Foovante Global Ltd",
    residency: "Ghana",
    registrationId: "GH-82401-2026",
    taxId: "TIN-992-X88",
    billingEmail: "billing@foovante-global.com",
    plan: "Enterprise ESG",
    status: "Active",
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-12">
        <div className="max-w-2xl">
          <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Building2 size={14} /> Corporate Identity & Compliance
          </p>
          <h1 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
            Organization <br /> Registry
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-6 leading-relaxed">
            Manage institutional details, tax residency, and cross-border
            billing parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-10">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">
                Institutional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Legal Entity Name
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    {orgData.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Registry Residency
                  </p>
                  <p className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Globe size={16} className="text-brand-500" />{" "}
                    {orgData.residency}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Registration ID
                  </p>
                  <p className="text-sm font-bold text-slate-600 font-mono">
                    {orgData.registrationId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    Tax Identification (TIN)
                  </p>
                  <p className="text-sm font-bold text-slate-600 font-mono">
                    {orgData.taxId}
                  </p>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">
                        Billing Contact
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {orgData.billingEmail}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest"
                  >
                    Modify
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
              <ShieldCheck size={160} className="text-brand-400" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-brand-400 text-[9px] font-black uppercase tracking-widest">
                    Active Subscription
                  </p>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">
                    {orgData.plan}
                  </h3>
                </div>
                <Badge className="bg-brand-500/20 text-brand-400 border-none font-black text-[10px] px-4 py-1 uppercase tracking-widest">
                  Institutional Verified
                </Badge>
              </div>
              <div className="flex gap-4">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black uppercase text-[10px] px-8 tracking-widest">
                  Manage Plan
                </Button>
                <Button
                  variant="ghost"
                  className="text-white/40 hover:text-white rounded-xl font-black uppercase text-[10px] px-8 tracking-widest"
                >
                  View Billing History
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Institutional Governance
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: CheckCircle2,
                  label: "AML Verified",
                  desc: "Anti-Money Laundering protocol active",
                },
                {
                  icon: ShieldCheck,
                  label: "KYB Finalized",
                  desc: "Corporate identity proof anchored",
                },
                {
                  icon: Tag,
                  label: "Tax Compliant",
                  desc: "Registry records up to date",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2rem] space-y-4">
            <Info className="text-blue-500" size={24} />
            <p className="text-[11px] text-blue-700 font-bold uppercase italic leading-relaxed">
              All organizational changes trigger a cryptographic audit log and
              may require administrative re-verification for high-value
              transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
