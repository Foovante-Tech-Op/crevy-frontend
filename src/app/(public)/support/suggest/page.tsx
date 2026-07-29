"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  SUGGESTION_CATEGORIES,
  SuggestionService,
} from "@/lib/services/suggestion-service";
import { cn } from "@/lib/utils";

export default function SuggestPage() {
  const [category, setCategory] =
    useState<(typeof SUGGESTION_CATEGORIES)[number]["value"]>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: SuggestionService.createSuggestion,
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Suggestion submitted", {
        description: "Thank you — we have received your feedback.",
      });
    },
    onError: (error: any) => {
      toast.error("Submission failed", {
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    mutation.mutate({
      category,
      title,
      description,
      ...(contactEmail ? { contactEmail } : {}),
      metadata: { source: "/support/suggest" },
    });
  };

  return (
    <div className="animate-in fade-in duration-700 pb-24 bg-slate-50 min-h-screen">
      {/* ── Editorial Header ── */}
      <div className="bg-white border-b border-slate-200 pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Support
          </Link>

          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-sans text-slate-900 tracking-tight leading-none mb-6">
              Suggest an <span className="italic text-brand">Improvement.</span>
            </h1>
            <p className="text-slate-500 text-lg font-light leading-relaxed">
              Help us make Crevy better. Whether it is a feature idea, a bug
              report, or a question about our methodologies, we read every
              submission.
            </p>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="max-w-2xl">
          {submitted ? (
            <div className="border border-slate-200 bg-white p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-brand mx-auto mb-6" />
              <h2 className="text-2xl font-sans font-bold text-slate-900 mb-3">
                Suggestion Received
              </h2>
              <p className="text-slate-500 mb-8">
                Thank you for taking the time. If you provided an email address,
                we will follow up when we have an update.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setCategory(undefined);
                    setTitle("");
                    setDescription("");
                    setContactEmail("");
                  }}
                  className="rounded-none bg-foreground hover:bg-brand text-[10px] font-bold uppercase tracking-widest h-12 px-6"
                >
                  Submit Another
                </Button>
                <Link href="/support">
                  <Button
                    variant="outline"
                    className="rounded-none text-[10px] font-bold uppercase tracking-widest h-12 px-6"
                  >
                    Return to Support
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="border border-slate-200 bg-white p-8 md:p-12 space-y-8"
            >
              {/* Category */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">
                  Category
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUGGESTION_CATEGORIES.map((cat) => {
                    const selected = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={cn(
                          "text-left px-4 py-3 border text-sm font-medium transition-colors",
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 text-slate-600 hover:border-slate-400",
                        )}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-900"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary of your suggestion"
                  className="w-full bg-transparent border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label
                  htmlFor="description"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-900"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about the idea, issue, or question..."
                  className="w-full bg-transparent border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none resize-none"
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-3">
                <label
                  htmlFor="email"
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-900"
                >
                  Contact Email{" "}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors rounded-none"
                />
              </div>

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-none bg-foreground hover:bg-brand text-[10px] font-bold uppercase tracking-widest h-12 px-8 w-full sm:w-auto"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" /> Submit Suggestion
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
