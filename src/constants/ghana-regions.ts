// src/constants/ghana-regions.ts
//
// Ghana's 16 administrative regions (post-2018 split). Small, fixed,
// well-known list — unlike "farm/project type" (see the field-agent
// register page), this genuinely belongs in a dropdown rather than free
// text: there's no ambiguity about what the options are, and a dropdown
// avoids the typo/formatting drift free text invites ("Ashanti" vs
// "ashanti region" vs "Ashanti Region") for data that gets grouped and
// filtered on elsewhere in the app.

export const GHANA_REGIONS = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
] as const;

export type TGhanaRegion = (typeof GHANA_REGIONS)[number];

/**
 * Best-effort match of a free-text region string (e.g. from reverse
 * geocoding, which returns whatever OpenStreetMap happens to have —
 * "Ashanti Region", "ASHANTI", etc.) against the canonical list above.
 * Returns null rather than guessing when nothing reasonably matches, so
 * callers can leave the dropdown for the person to set themselves instead
 * of silently selecting the wrong region.
 */
export function matchGhanaRegion(
  input: string | undefined | null,
): TGhanaRegion | null {
  if (!input) return null;
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/\bregion\b/g, "")
    .trim();
  if (!normalized) return null;

  const exact = GHANA_REGIONS.find((r) => r.toLowerCase() === normalized);
  if (exact) return exact;

  // A couple of common alternate names that don't literally contain the
  // canonical region name as a substring.
  const ALIASES: Record<string, TGhanaRegion> = {
    "brong ahafo": "Bono", // pre-2019 region, split into Bono/Bono East/Ahafo
  };
  if (ALIASES[normalized]) return ALIASES[normalized];

  // Loose substring match as a last resort (e.g. "Greater Accra Metropolis").
  const partial = GHANA_REGIONS.find(
    (r) =>
      normalized.includes(r.toLowerCase()) ||
      r.toLowerCase().includes(normalized),
  );
  return partial ?? null;
}
