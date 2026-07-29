"use client";

import { ArrowLeft, Check, Copy, KeyRound, Radar, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Endpoint = {
  method: "GET" | "POST" | "PATCH";
  path: string;
  summary: string;
};

const endpointGroups: {
  group: string;
  icon: React.ElementType;
  endpoints: Endpoint[];
}[] = [
  {
    group: "Entities & Projects",
    icon: Wallet,
    endpoints: [
      {
        method: "GET",
        path: "/v2/projects",
        summary: "List all projects for your organization",
      },
      {
        method: "POST",
        path: "/v2/projects",
        summary: "Register a new project for verification",
      },
      {
        method: "GET",
        path: "/v2/projects/{id}",
        summary: "Retrieve a single project's status",
      },
    ],
  },
  {
    group: "Telemetry & dMRV",
    icon: Radar,
    endpoints: [
      {
        method: "POST",
        path: "/v2/telemetry",
        summary: "Submit signed sensor or IoT payloads",
      },
      {
        method: "GET",
        path: "/v2/telemetry/{projectId}",
        summary: "Fetch ingested telemetry history",
      },
    ],
  },
  {
    group: "Credits",
    icon: Check,
    endpoints: [
      {
        method: "GET",
        path: "/v2/credits",
        summary: "List issued credits and their status",
      },
      {
        method: "PATCH",
        path: "/v2/credits/{id}/retire",
        summary: "Retire a credit against a claim",
      },
    ],
  },
];

const methodColor: Record<Endpoint["method"], string> = {
  GET: "text-sky-400 border-sky-900",
  POST: "text-emerald-400 border-emerald-900",
  PATCH: "text-amber-400 border-amber-900",
};

const CODE_SAMPLE = `curl https://api.crevy.io/v2/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access unavailable — ignore
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-slate-800 font-mono text-sm">
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800">
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
          Request
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-6 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Support
          </Link>

          <h1 className="text-4xl md:text-6xl font-sans text-slate-900 tracking-tight leading-none mb-6">
            API <span className="italic text-brand">Documentation.</span>
          </h1>
          <p className="text-slate-500 text-lg font-light leading-relaxed max-w-2xl">
            Build directly on the Crevy ledger — register projects, submit
            telemetry, and manage credits programmatically.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* ── Main Content ── */}
        <div className="lg:col-span-8 space-y-16">
          {/* Authentication */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8 flex items-center gap-2">
              <KeyRound size={14} className="text-brand" />
              Authentication
            </h2>
            <p className="text-sm text-slate-500 font-light leading-relaxed mb-6">
              Every request must include a bearer token in the{" "}
              <code className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                Authorization
              </code>{" "}
              header. Generate a key from your organization settings once your
              entity has been verified.
            </p>
            <CodeBlock code={CODE_SAMPLE} />
          </section>

          {/* Endpoints */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8">
              Endpoint Reference
            </h2>
            <div className="space-y-10">
              {endpointGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.group}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900">
                        <GroupIcon size={14} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-semibold font-sans text-slate-900 tracking-tight">
                        {group.group}
                      </h3>
                    </div>
                    <div className="border border-slate-200 bg-white divide-y divide-slate-100">
                      {group.endpoints.map((ep) => (
                        <div
                          key={ep.path}
                          className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6"
                        >
                          <span
                            className={`text-[10px] font-bold uppercase tracking-widest font-mono border px-2 py-1 w-fit ${methodColor[ep.method]} bg-[#0a0a0a]`}
                          >
                            {ep.method}
                          </span>
                          <code className="text-sm font-mono text-slate-900 font-semibold">
                            {ep.path}
                          </code>
                          <span className="text-sm text-slate-500 font-light sm:ml-auto">
                            {ep.summary}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Rate Limits */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 border-b-2 border-slate-900 pb-4 mb-8">
              Rate Limits & Errors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-slate-200 bg-white p-8">
                <div className="text-3xl font-sans text-slate-900 tracking-tight mb-2">
                  120<span className="text-brand">/min</span>
                </div>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Standard rate limit per API key. Telemetry ingestion endpoints
                  carry a separate, higher-throughput allowance — contact us for
                  bulk integration needs.
                </p>
              </div>
              <div className="border border-slate-200 bg-white p-8">
                <div className="text-3xl font-sans text-slate-900 tracking-tight mb-2">
                  4xx<span className="text-brand"> / 5xx</span>
                </div>
                <p className="text-sm text-slate-500 font-light leading-relaxed">
                  Errors return a JSON body with a{" "}
                  <code className="bg-slate-100 border border-slate-200 px-1 text-xs font-mono">
                    code
                  </code>{" "}
                  and{" "}
                  <code className="bg-slate-100 border border-slate-200 px-1 text-xs font-mono">
                    message
                  </code>{" "}
                  field for programmatic handling.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 border border-slate-200 bg-white p-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-4 mb-6 block">
              On this page
            </span>
            <nav className="space-y-4 mb-8">
              <a
                href="/#"
                className="block text-sm text-slate-600 hover:text-brand transition-colors"
              >
                Authentication
              </a>
              <a
                href="/#"
                className="block text-sm text-slate-600 hover:text-brand transition-colors"
              >
                Endpoint Reference
              </a>
              <a
                href="/#"
                className="block text-sm text-slate-600 hover:text-brand transition-colors"
              >
                Rate Limits & Errors
              </a>
            </nav>
            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500 font-light leading-relaxed mb-4">
                Need a key, or hitting an integration issue our docs don't
                cover?
              </p>
              <Link
                href="/support/faq"
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 border border-slate-900 bg-foreground text-white hover:bg-white hover:text-foreground transition-colors"
              >
                Visit the Help Desk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
