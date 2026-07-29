import { axiosClient } from "../axiosClient";

export type SuggestionCategory =
  | "feature_request"
  | "bug_report"
  | "methodology_question"
  | "billing_support"
  | "general_feedback"
  | "partnership_inquiry";

export type SuggestionStatus =
  | "open"
  | "under_review"
  | "accepted"
  | "declined"
  | "closed";

export type SuggestionPayload = {
  category: SuggestionCategory;
  title: string;
  description: string;
  contactEmail?: string;
  metadata?: Record<string, unknown>;
};

export const SUGGESTION_CATEGORIES: {
  value: SuggestionCategory;
  label: string;
}[] = [
  { value: "feature_request", label: "Feature Request" },
  { value: "bug_report", label: "Bug Report" },
  { value: "methodology_question", label: "Methodology Question" },
  { value: "billing_support", label: "Billing Support" },
  { value: "general_feedback", label: "General Feedback" },
  { value: "partnership_inquiry", label: "Partnership Inquiry" },
];

export const SuggestionService = {
  createSuggestion: async (
    payload: SuggestionPayload,
  ): Promise<{ success: boolean; message: string; data: unknown }> => {
    const response = await axiosClient.post("/suggestions", payload);
    return response.data;
  },
};
