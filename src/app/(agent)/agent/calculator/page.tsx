"use client";

// F4 — Field-agent carbon calculator.
//
// Renders the exact same 4-step calculator flow used on the admin
// dashboard (household → transportation → energy & consumption →
// results/history) — see CarbonCalculatorFlow for the single shared
// implementation. Field agents get the full form, not a stripped-down
// travel-only version, so the experience (and the data it produces) is
// consistent across both surfaces.

import { CarbonCalculatorFlow } from "@/components/carbon-calculator/CarbonCalculatorFlow";

export default function AgentCalculatorPage() {
  return <CarbonCalculatorFlow />;
}
