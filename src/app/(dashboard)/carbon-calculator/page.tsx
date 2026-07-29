"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { countries } from "country-data-list";
import {
  Activity,
  ArrowRight,
  Battery,
  Car,
  History,
  Home,
  Leaf,
  MapPin,
  Sun,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CountryDropdown } from "@/components/ui/country-dropdown";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CarbonFootprintInputs,
  type CarbonFootprintResult,
  CarbonFootprintService,
} from "@/lib/services/carbon-footprint-service";
import { cn } from "@/lib/utils";

const householdSchema = z.object({
  people: z.coerce.number().int().min(1, "Add the number of people").optional(),
  homeSize: z
    .enum(["small_apartment", "medium_house", "large_house", "shared_housing"])
    .optional(),
  jobTitle: z.string().optional(),
});

const transportSchema = z.object({
  carFrequency: z.enum(["never", "1-2", "3-4", "daily"]).optional(),
  carFuelType: z
    .enum(["electric", "hybrid", "petrol", "diesel", "none"])
    .optional(),
  flights: z.enum(["none", "short", "long", "multiple"]).optional(),
});

const energySchema = z.object({
  powerSources: z
    .array(z.enum(["renewable", "grid", "gas", "unsure"]))
    .optional(),
  electricityBill: z
    .enum(["30-60", "60-120", "120-250", "250-500", "500+"])
    .optional(),
});

const lifestyleSchema = z.object({
  dietType: z.enum(["vegan", "vegetarian", "mixed", "high_meat"]).optional(),
});

const calculatorSchema = z.object({
  regionCode: z.string().min(1).optional(),
  household: householdSchema.optional(),
  transport: transportSchema.optional(),
  energy: energySchema.optional(),
  lifestyle: lifestyleSchema.optional(),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

const STEPS = [
  {
    id: 1,
    title: "Household Info",
    subtitle: "Let's begin with a few quick details about your household.",
  },
  {
    id: 2,
    title: "Transportation",
    subtitle:
      "This helps us estimate your weekly emissions from private transport.",
  },
  {
    id: 3,
    title: "Energy & Consumption",
    subtitle: "Tell us how you power your home and what you eat.",
  },
  {
    id: 4,
    title: "Calculation Results",
    subtitle:
      "See your estimated carbon footprint and the impact of your lifestyle.",
  },
];

const HOME_OPTIONS = [
  {
    id: "small_apartment",
    label: "Small apartment",
    hint: "Compact, efficient living",
    icon: Home,
  },
  {
    id: "medium_house",
    label: "Medium house",
    hint: "Family-sized residence",
    icon: Users,
  },
  {
    id: "large_house",
    label: "Large house / villa",
    hint: "Spacious property",
    icon: Leaf,
  },
  {
    id: "shared_housing",
    label: "Shared housing",
    hint: "Multiple households under one roof",
    icon: MapPin,
  },
];

const CAR_FREQUENCY_OPTIONS = [
  { id: "never", label: "Never", hint: "I don't use a car" },
  { id: "1-2", label: "1-2 days", hint: "Occasional trips" },
  { id: "3-4", label: "3-4 days", hint: "Regular use" },
  { id: "daily", label: "Daily", hint: "Everyday driving" },
];

const CAR_TYPE_OPTIONS = [
  {
    id: "electric",
    label: "Electric",
    hint: "Cleanest option",
    icon: Battery,
  },
  {
    id: "hybrid",
    label: "Hybrid",
    hint: "Lower emissions",
    icon: Car,
  },
  {
    id: "petrol",
    label: "Petrol",
    hint: "Common fuel type",
    icon: Car,
  },
  {
    id: "diesel",
    label: "Diesel",
    hint: "Higher emissions",
    icon: Car,
  },
  {
    id: "none",
    label: "I don't drive",
    hint: "No car emissions",
    icon: Activity,
  },
];

const FLIGHT_OPTIONS = [
  { id: "none", label: "0", hint: "No flights" },
  { id: "short", label: "1-2 short flights", hint: "Within the region" },
  { id: "long", label: "1-2 long flights", hint: "Intercontinental travel" },
  { id: "multiple", label: "3+ flights", hint: "Frequent travel" },
];

const POWER_SOURCE_OPTIONS = [
  { id: "renewable", label: "Renewable (solar, hydro, etc.)" },
  { id: "grid", label: "Electricity from national grid" },
  { id: "gas", label: "Gas, charcoal, or firewood" },
  { id: "unsure", label: "I'm not sure" },
];

const BILL_OPTIONS = [
  { id: "30-60", label: "GHc30 - GHc60" },
  { id: "60-120", label: "GHc60 - GHc120" },
  { id: "120-250", label: "GHc120 - GHc250" },
  { id: "250-500", label: "GHc250 - GHc500" },
  { id: "500+", label: "GHc500+" },
];

const DIET_OPTIONS = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "mixed", label: "Mixed (some meat)" },
  { id: "high_meat", label: "High meat consumption" },
];

const BILL_RANGE_TO_KWH: Record<string, number> = {
  "30-60": 200,
  "60-120": 450,
  "120-250": 900,
  "250-500": 1600,
  "500+": 2500,
};

const FREQUENCY_TO_MONTHLY_KM: Record<string, number> = {
  never: 0,
  "1-2": 400,
  "3-4": 950,
  daily: 1700,
};

const FLIGHT_BRACKETS: Record<string, { short: number; long: number }> = {
  none: { short: 0, long: 0 },
  short: { short: 1, long: 0 },
  long: { short: 0, long: 1 },
  multiple: { short: 2, long: 1 },
};

const TREES_PER_TCO2E = 25.4;

// Pie/line palette derived purely from the theme tokens (brand, foreground, background)
// so charts stay on-brand instead of using arbitrary hardcoded colors.
const PIE_COLORS = [
  "var(--brand)",
  "var(--foreground)",
  "color-mix(in oklch, var(--brand) 55%, var(--background))",
  "color-mix(in oklch, var(--foreground) 45%, var(--background))",
  "color-mix(in oklch, var(--brand) 70%, var(--foreground))",
];
const GRID_COLOR =
  "color-mix(in oklch, var(--foreground) 12%, var(--background))";
const AXIS_COLOR =
  "color-mix(in oklch, var(--foreground) 55%, var(--background))";

// Map frontend diet types to backend CarbonFootprintInputs diet types
const DIET_TYPE_MAP: Record<string, string> = {
  vegan: "vegan",
  vegetarian: "vegetarian",
  mixed: "omnivore_average",
  high_meat: "meat_heavy",
};

/**
 * Unified results + history view.
 *
 * One dataset drives everything: the line chart plots every past calculation,
 * and clicking (or tapping) a point on that line — or a row in the list below
 * it — swaps which calculation's summary + category pie chart are shown above.
 * A freshly-run calculation is just the newest point, selected by default.
 */
function CalculationInsights({
  calculations,
  selectedId,
  onSelect,
}: {
  calculations: CarbonFootprintResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (calculations.length === 0) {
    return (
      <Card className="border border-slate-200 bg-white shadow-none">
        <CardContent className="p-8 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            No history yet
          </h3>
          <p className="text-base text-slate-600">
            Complete your first calculation to begin tracking changes over time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selected =
    calculations.find((calc) => calc.id === selectedId) ?? calculations[0];

  const totalTco2e = Number(selected.totalCo2eKg) / 1000;
  const treesEquivalent = totalTco2e * TREES_PER_TCO2E;

  const categoryTotals: Record<string, number> = {};
  selected.breakdown.forEach((item) => {
    categoryTotals[item.category] =
      (categoryTotals[item.category] || 0) + item.co2eKg;
  });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: `${name.charAt(0).toUpperCase()}${name.slice(1)}`,
    value: Number(value.toFixed(2)),
  }));

  // Oldest → newest for the trend line; each point carries its calculation id
  // so clicking through the line can drive the summary + pie above it.
  const chartData = calculations
    .slice()
    .reverse()
    .map((calc) => ({
      id: calc.id,
      date: new Date(calc.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      co2e: Number(calc.totalCo2eKg),
    }));

  const handleChartClick = (state: any) => {
    const point = state?.activePayload?.[0]?.payload;
    if (point?.id) onSelect(point.id);
  };

  const renderDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    const isSelected = payload.id === selected.id;
    return (
      <circle
        key={`dot-${payload.id ?? index}`}
        cx={cx}
        cy={cy}
        r={isSelected ? 7 : 4}
        fill={isSelected ? "var(--brand)" : "var(--foreground)"}
        stroke="var(--background)"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={() => onSelect(payload.id)}
        role="button"
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Summary + breakdown for whichever point is selected */}
      <Card className="border border-slate-800 bg-background p-0 shadow-none rounded-none">
        <CardContent className="p-10">
          <div className="grid gap-8 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Leaf className="w-4 h-4" />
                {selected.id === calculations[0]?.id
                  ? "Most recent calculation"
                  : "Selected calculation"}
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Annual CO2 emitted
                </p>
                <div className="font-mono text-6xl font-extrabold text-brand tabular-nums">
                  {totalTco2e.toFixed(1)}{" "}
                  <span className="text-2xl text-foreground">t CO2e</span>
                </div>
              </div>
              <p className="text-base text-slate-600 font-light leading-relaxed">
                This estimate is based on the household, transport, energy and
                dietary choices submitted for this calculation. Click any point
                on the timeline below to compare a past run.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Tree equivalent
                  </p>
                  <p className="mt-3 font-mono text-3xl font-bold text-foreground tabular-nums">
                    {treesEquivalent.toFixed(1)}
                  </p>
                  <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">
                    tree seedlings grown for a year
                  </p>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Period
                  </p>
                  <p className="mt-3 font-mono text-3xl font-bold text-foreground tabular-nums">
                    {selected.periodLabel}
                  </p>
                  <p className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-500">
                    {new Date(selected.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {pieData.length > 0 ? (
              <div className="border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">
                  Category breakdown
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={90}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toFixed(2)} kg CO2e`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Trend line — click any point to change what's shown above */}
      <Card className="border border-slate-200 bg-background shadow-none">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-foreground">
              Your calculation history
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Click a point to compare
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ left: -20, right: 0, top: 10, bottom: 0 }}
              onClick={handleChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis
                dataKey="date"
                stroke={AXIS_COLOR}
                tick={{ fill: AXIS_COLOR }}
              />
              <YAxis
                stroke={AXIS_COLOR}
                tick={{ fill: AXIS_COLOR }}
                label={{
                  value: "kg CO2e",
                  angle: -90,
                  position: "insideLeft",
                  fill: AXIS_COLOR,
                }}
              />
              <Tooltip
                formatter={(value) => `${Number(value).toFixed(1)} kg CO2e`}
                contentStyle={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <Line
                type="monotone"
                dataKey="co2e"
                stroke="var(--brand)"
                strokeWidth={3}
                dot={renderDot}
                activeDot={renderDot}
                cursor="pointer"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-8 space-y-3">
            {calculations.slice(0, 6).map((calc) => {
              const isSelected = calc.id === selected.id;
              return (
                <button
                  key={calc.id}
                  type="button"
                  onClick={() => onSelect(calc.id)}
                  className={cn(
                    "w-full flex justify-between gap-4 border p-4 text-left transition-colors",
                    isSelected
                      ? "border-brand bg-brand/10"
                      : "border-slate-200 bg-slate-50 hover:border-slate-800",
                  )}
                >
                  <div>
                    <p className="font-mono font-bold text-foreground tabular-nums">
                      {Number(calc.totalCo2eKg).toFixed(1)} kg CO2e
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(calc.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-mono uppercase tracking-widest text-slate-500">
                    {calc.regionCode}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="border border-slate-200 bg-slate-50 p-8">
        <h3 className="text-xl font-bold text-foreground mb-4">
          Interpretation
        </h3>
        <p className="text-base text-slate-600 font-light leading-relaxed">
          Lifestyle calculations are estimates. Energy and transport inputs tend
          to be more precise than spend-based values. Use this result as a
          starting point to compare how changes in travel, home energy and diet
          affect your score.
        </p>
      </div>
    </div>
  );
}

export default function CarbonCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState<CarbonFootprintResult | null>(null);
  const [history, setHistory] = useState<CarbonFootprintResult[]>([]);
  const [selectedCalculationId, setSelectedCalculationId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema) as any,
    defaultValues: {
      regionCode: "GHA",
      household: {
        people: 1,
        homeSize: "small_apartment",
        jobTitle: "",
      },
      transport: {
        carFrequency: "1-2",
        carFuelType: "electric",
        flights: "none",
      },
      energy: {
        powerSources: ["grid"],
        electricityBill: "60-120",
      },
      lifestyle: {
        dietType: "mixed",
      },
    },
  });

  const homeSize = form.watch("household.homeSize");
  const carFrequency = form.watch("transport.carFrequency");
  const carFuelType = form.watch("transport.carFuelType");
  const flightOption = form.watch("transport.flights");
  const electricityBill = form.watch("energy.electricityBill");
  const powerSources = form.watch("energy.powerSources") ?? [];
  const dietType = form.watch("lifestyle.dietType");

  const loadHistory = useCallback(async () => {
    try {
      const data = await CarbonFootprintService.getHistory({ limit: 10 });
      setHistory(data.calculations);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Default the selection to the most recent calculation once history loads,
  // without stomping on a selection the user already made by clicking a point.
  useEffect(() => {
    if (!selectedCalculationId && history.length > 0) {
      setSelectedCalculationId(history[0].id);
    }
  }, [history, selectedCalculationId]);

  // Scroll the unified results/history view into place once a calculation
  // completes, so the new point is visible without extra navigation.
  useEffect(() => {
    if (currentStep === 4) {
      document
        .getElementById("calculation-insights")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentStep]);

  const createPayload = (data: CalculatorFormData): CarbonFootprintInputs => {
    const payload: CarbonFootprintInputs = {};

    const energy: CarbonFootprintInputs["energy"] = {};
    if (data.energy?.electricityBill) {
      energy.electricityKwh = BILL_RANGE_TO_KWH[data.energy.electricityBill];
      energy.electricityPeriod = "monthly";
    }
    if (data.energy?.powerSources) {
      energy.usesRenewables = data.energy.powerSources.includes("renewable")
        ? "yes"
        : "no";
    }
    if (Object.keys(energy).length > 0) {
      payload.energy = energy;
    }

    const transport: CarbonFootprintInputs["transport"] = {};
    if (data.transport?.carFrequency) {
      transport.carKm = FREQUENCY_TO_MONTHLY_KM[data.transport.carFrequency];
      transport.carPeriod = "monthly";
    }
    if (data.transport?.carFuelType && data.transport.carFuelType !== "none") {
      transport.carFuelType = data.transport.carFuelType;
    }
    if (data.transport?.flights) {
      const bracket = FLIGHT_BRACKETS[data.transport.flights];
      if (bracket.short > 0) {
        transport.flightsShortHaulPerYear = bracket.short;
      }
      if (bracket.long > 0) {
        transport.flightsLongHaulPerYear = bracket.long;
      }
    }
    if (Object.keys(transport).length > 0) {
      payload.transport = transport;
    }

    const lifestyle: CarbonFootprintInputs["lifestyle"] = {};
    if (data.lifestyle?.dietType) {
      lifestyle.dietType = DIET_TYPE_MAP[data.lifestyle.dietType] as any;
    }
    if (Object.keys(lifestyle).length > 0) {
      payload.lifestyle = lifestyle;
    }

    return payload;
  };

  const onSubmit = async (data: CalculatorFormData) => {
    setIsSubmitting(true);
    try {
      const payload = createPayload(data);
      // CountryDropdown stores alpha3 codes (e.g. "GHA"); backend expects alpha2 (e.g. "GH")
      const country = (countries.all as any[]).find(
        (c) => c.alpha3 === data.regionCode,
      );
      const backendRegionCode = country?.alpha2 || data.regionCode;

      const response = await CarbonFootprintService.calculate({
        inputs: payload,
        regionCode: backendRegionCode,
      });

      setResult(response);
      // The new calculation immediately becomes "most recent" in the unified
      // results/history view — prepend it optimistically so there's no flash
      // of stale data while we refresh from the backend below.
      setHistory((prev) => [
        response,
        ...prev.filter((calc) => calc.id !== response.id),
      ]);
      setSelectedCalculationId(response.id);
      toast.success("Carbon footprint calculated successfully!");
      setCurrentStep(4);
      loadHistory();
    } catch (error: any) {
      toast.error(error?.message || "Failed to calculate footprint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep = async () => {
    if (currentStep === 1) {
      return form.trigger([
        "household.people",
        "household.homeSize",
        "regionCode",
      ]);
    }

    if (currentStep === 2) {
      return form.trigger([
        "transport.carFrequency",
        "transport.carFuelType",
        "transport.flights",
      ]);
    }

    if (currentStep === 3) {
      return form.trigger([
        "energy.powerSources",
        "energy.electricityBill",
        "lifestyle.dietType",
      ]);
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (currentStep === 3) {
      await form.handleSubmit(onSubmit)();
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, STEPS.length));
  };

  const handleBack = () => {
    if (currentStep === 4 && result) {
      setCurrentStep(3);
      return;
    }
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const togglePowerSource = (option: string) => {
    const currentSources = form.getValues("energy.powerSources") || [];
    const nextSources = currentSources.includes(option as any)
      ? currentSources.filter((value: string) => value !== option)
      : [...currentSources, option];
    form.setValue("energy.powerSources", nextSources as any);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute right-0 top-20 h-[420px] w-[420px] bg-brand/40" />
        <div className="container mx-auto max-w-7xl px-6 pt-14 pb-18 relative">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-3 px-4 py-2 border border-slate-300 bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Sun className="w-4 h-4" />
                Calculator
              </span>
              <div className="max-w-2xl space-y-6">
                <h1 className="font-extrabold text-5xl md:text-6xl text-slate-900 leading-[1.05] tracking-tight">
                  Individual Carbon Credit{" "}
                  <span className="text-brand">Calculator</span>
                </h1>
                <p className="text-base md:text-xl text-slate-600 font-light leading-relaxed">
                  Calculate your personal carbon credits based on your
                  lifestyle. Split the journey into easy steps and discover
                  where small changes can make a big impact.
                </p>
              </div>
            </div>

            <Card className="border border-slate-800 bg-white shadow-none rounded-none">
              <CardContent className="p-8 md:p-10">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Step {currentStep} of {STEPS.length}
                      </p>
                      <h2 className="mt-2 text-3xl font-bold text-slate-900">
                        {STEPS[currentStep - 1].title}
                      </h2>
                    </div>
                    <div className="w-full sm:w-64">
                      <div className="h-2 overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-brand transition-all duration-500"
                          style={{
                            width: `${(currentStep / STEPS.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-600">
                    {STEPS[currentStep - 1].subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative z-10 -mt-24 px-6 pb-24">
        <div className="container mx-auto max-w-5xl">
          <Card className="border border-slate-200 bg-white shadow-none rounded-none lg:mt-8">
            <CardContent className="p-8 md:p-10">
              <Form {...form}>
                <form
                  className="space-y-10"
                  onSubmit={(event) => event.preventDefault()}
                >
                  {currentStep === 1 && (
                    <div className="space-y-10">
                      <div className="grid gap-8 lg:grid-cols-2">
                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <Label
                            htmlFor="people"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
                          >
                            How many people live in your household?
                          </Label>
                          <Controller
                            name="household.people"
                            control={form.control as any}
                            render={({ field }) => (
                              <Input
                                id="people"
                                type="number"
                                min={1}
                                placeholder="0"
                                className="mt-4 h-16 border-slate-300 bg-white font-mono text-xl font-bold text-slate-900 tabular-nums focus:ring-brand"
                                {...field}
                              />
                            )}
                          />
                        </div>

                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <div className="flex flex-col gap-3">
                            <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                              What is your home size or type?
                            </Label>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {HOME_OPTIONS.map((option) => {
                                const ActiveIcon = option.icon;
                                const active = homeSize === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      form.setValue(
                                        "household.homeSize",
                                        option.id as any,
                                      )
                                    }
                                    className={cn(
                                      "border p-5 text-left transition-colors",
                                      active
                                        ? "border-brand bg-brand/10 text-slate-900"
                                        : "border-slate-300 bg-white hover:border-slate-800",
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="flex h-11 w-11 items-center justify-center bg-slate-100 text-brand">
                                        <ActiveIcon className="w-5 h-5" />
                                      </span>
                                      <div>
                                        <p className="font-bold">
                                          {option.label}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {option.hint}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-8 lg:grid-cols-2">
                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <Label
                            htmlFor="jobTitle"
                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
                          >
                            Job Title / Role
                          </Label>
                          <Controller
                            name="household.jobTitle"
                            control={form.control as any}
                            render={({ field }) => (
                              <Input
                                id="jobTitle"
                                placeholder="e.g. Founder, CEO"
                                className="mt-4 h-16 border-slate-300 bg-white focus:ring-brand"
                                {...field}
                              />
                            )}
                          />
                        </div>

                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            Country of Residence
                          </Label>
                          <CountryDropdown
                            control={form.control as any}
                            name="regionCode"
                            placeholder="Select a country"
                            className="mt-4"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-10">
                      <div className="border border-slate-200 bg-slate-50 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                          How often do you use a car in a typical week?
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {CAR_FREQUENCY_OPTIONS.map((option) => {
                            const active = carFrequency === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  form.setValue(
                                    "transport.carFrequency",
                                    option.id as any,
                                  )
                                }
                                className={cn(
                                  "border p-5 text-left transition-colors",
                                  active
                                    ? "border-brand bg-brand/10 text-slate-900"
                                    : "border-slate-300 bg-white hover:border-slate-800",
                                )}
                              >
                                <p className="font-bold">{option.label}</p>
                                <p className="text-sm text-slate-500">
                                  {option.hint}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-slate-200 bg-slate-50 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                          What type of car do you use most often?
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {CAR_TYPE_OPTIONS.map((option) => {
                            const ActiveIcon = option.icon;
                            const active = carFuelType === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  form.setValue(
                                    "transport.carFuelType",
                                    option.id as any,
                                  )
                                }
                                className={cn(
                                  "border p-5 text-left transition-colors",
                                  active
                                    ? "border-brand bg-brand/10 text-slate-900"
                                    : "border-slate-300 bg-white hover:border-slate-800",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="flex h-11 w-11 items-center justify-center bg-slate-100 text-brand">
                                    <ActiveIcon className="w-5 h-5" />
                                  </span>
                                  <div>
                                    <p className="font-bold">{option.label}</p>
                                    <p className="text-sm text-slate-500">
                                      {option.hint}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-slate-200 bg-slate-50 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                          How many flights do you take in a year?
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {FLIGHT_OPTIONS.map((option) => {
                            const active = flightOption === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  form.setValue(
                                    "transport.flights",
                                    option.id as any,
                                  )
                                }
                                className={cn(
                                  "border p-5 text-left transition-colors",
                                  active
                                    ? "border-brand bg-brand/10 text-slate-900"
                                    : "border-slate-300 bg-white hover:border-slate-800",
                                )}
                              >
                                <p className="font-bold">{option.label}</p>
                                <p className="text-sm text-slate-500">
                                  {option.hint}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-10">
                      <div className="border border-slate-200 bg-slate-50 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                          How do you power your home?{" "}
                          <span className="font-normal">
                            (Select all that apply)
                          </span>
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {POWER_SOURCE_OPTIONS.map((option) => {
                            const checked = powerSources.includes(
                              option.id as any,
                            );
                            return (
                              <div
                                key={option.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => togglePowerSource(option.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    togglePowerSource(option.id);
                                  }
                                }}
                                className={cn(
                                  "border p-5 text-left transition-colors cursor-pointer",
                                  checked
                                    ? "border-brand bg-brand/10 text-slate-900"
                                    : "border-slate-300 bg-white hover:border-slate-800",
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                      togglePowerSource(option.id)
                                    }
                                    className="border-slate-300 text-brand"
                                  />
                                  <div>
                                    <p className="font-bold">{option.label}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-8 lg:grid-cols-2">
                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            What's your average monthly electricity bill?
                          </Label>
                          <Controller
                            name="energy.electricityBill"
                            control={form.control as any}
                            render={({ field }) => (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="mt-4 h-16 border-slate-300 bg-white focus:ring-brand">
                                  <SelectValue placeholder="Choose a range" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BILL_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.id}
                                      value={option.id}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="border border-slate-200 bg-slate-50 p-6">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                            What's your diet type?
                          </p>
                          <div className="grid gap-3">
                            {DIET_OPTIONS.map((option) => {
                              const active = dietType === option.id;
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() =>
                                    form.setValue(
                                      "lifestyle.dietType",
                                      option.id as any,
                                    )
                                  }
                                  className={cn(
                                    "border p-5 text-left transition-colors",
                                    active
                                      ? "border-brand bg-brand/10 text-slate-900"
                                      : "border-slate-300 bg-white hover:border-slate-800",
                                  )}
                                >
                                  <p className="font-bold">{option.label}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && result && (
                    <div className="border border-slate-200 bg-slate-50 p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">
                          Calculation complete
                        </p>
                        <h3 className="text-2xl font-bold text-foreground">
                          {(Number(result.totalCo2eKg) / 1000).toFixed(1)} t
                          CO2e estimated for {result.periodLabel}
                        </h3>
                        <p className="mt-2 text-base text-slate-600 font-light leading-relaxed max-w-xl">
                          Your full breakdown and history trend are shown below,
                          with this run selected. Update any answers and press
                          Re-run to add a new data point.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <Button
                      variant="outline"
                      className="h-16 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold uppercase tracking-[0.2em] text-[10px] rounded-none"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                    >
                      Back
                    </Button>

                    <Button
                      type="button"
                      className="h-16 bg-brand rounded-none px-8 text-slate-900 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-900 hover:text-white transition-colors"
                      onClick={
                        currentStep === 4
                          ? () => form.handleSubmit(onSubmit)()
                          : handleNext
                      }
                      disabled={isSubmitting}
                    >
                      {currentStep === 4
                        ? "Re-run calculation"
                        : "Save and continue"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <div className="mt-10" id="calculation-insights">
              <CalculationInsights
                calculations={history}
                selectedId={selectedCalculationId}
                onSelect={setSelectedCalculationId}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
