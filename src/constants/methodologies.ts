export type Registry = "Verra" | "Gold Standard" | "ACR" | "CAR" | "Puro.earth";
export type Sector =
  | "Agriculture"
  | "Forestry"
  | "Waste"
  | "Renewable Energy"
  | "Blue Carbon"
  | "Engineered Removals";

export interface FoundationalStandard {
  id: string;
  title: string;
  scope: string[];
  purpose: string;
}

export interface Methodology {
  id: string;
  code: string;
  registry: Registry;
  title: string;
  sector: Sector;
  applicableTo: string[];
  targetProjects: string[]; // e.g., Cocoa, Cashew, Mini-grids
}

// The fixed editorial grid (Layer 1)
export const FOUNDATIONAL_STANDARDS: FoundationalStandard[] = [
  {
    id: "std-ghg",
    title: "Greenhouse Gas Protocol",
    scope: ["Agriculture", "Energy", "Forestry", "Waste", "Corporate"],
    purpose:
      "Provides the foundational baseline for emission source identification, scope categorization, and inventory development across all projects.",
  },
  {
    id: "std-iso14064",
    title: "ISO 14064 Series",
    scope: ["Organizational Inventories", "Project-Level Reductions"],
    purpose:
      "Ensures global consistency in the quantification, monitoring, reporting, and verification of GHG emission reductions.",
  },
  {
    id: "std-iso14067",
    title: "ISO 14067",
    scope: ["Agricultural Products", "Manufacturing", "Food Systems"],
    purpose:
      "Standardizes product-level carbon footprints, specifically targeted for agricultural exports like Cocoa, Coffee, and Cashew.",
  },
  {
    id: "std-ipcc",
    title: "IPCC Guidelines",
    scope: ["AFOLU", "Energy", "Waste"],
    purpose:
      "Serves as the ultimate default emission factor database for baseline calculations when localized terrestrial data is unavailable.",
  },
];

// The interactive, filterable methodology grid (Layers 2 & 3)
export const METHODOLOGY_CATALOG: Methodology[] = [
  // --- VERRA ---
  {
    id: "meth-vm0042",
    code: "VM0042",
    registry: "Verra",
    title: "Improved Agricultural Land Management",
    sector: "Agriculture",
    applicableTo: [
      "Regenerative agriculture",
      "Cover cropping",
      "Reduced tillage",
      "Crop rotation",
    ],
    targetProjects: ["Cocoa", "Maize", "Rice", "Cashew"],
  },
  {
    id: "meth-vm0044",
    code: "VM0044",
    registry: "Verra",
    title: "Methodology for Biochar Utilization",
    sector: "Waste",
    applicableTo: ["Biochar production", "Soil application"],
    targetProjects: ["Cocoa husks", "Rice husks", "Palm residues"],
  },
  {
    id: "meth-vm0015",
    code: "VM0015",
    registry: "Verra",
    title: "Avoided Unplanned Deforestation",
    sector: "Forestry",
    applicableTo: ["Forest protection projects", "Conservation"],
    targetProjects: ["Forest restoration"],
  },
  {
    id: "meth-vm0007",
    code: "VM0007",
    registry: "Verra",
    title: "Afforestation and Reforestation",
    sector: "Forestry",
    applicableTo: ["Tree planting", "Restoration", "Agroforestry"],
    targetProjects: ["Cocoa agroforestry", "Shea parklands"],
  },
  {
    id: "meth-vm0022",
    code: "VM0022",
    registry: "Verra",
    title: "Organic Waste Composting",
    sector: "Waste",
    applicableTo: ["Food waste", "Municipal waste", "Agricultural waste"],
    targetProjects: ["Composting", "Organic waste diversion"],
  },
  {
    id: "meth-vm0034",
    code: "VM0034",
    registry: "Verra",
    title: "Methane Recovery",
    sector: "Waste",
    applicableTo: ["Landfills", "Anaerobic digestion"],
    targetProjects: ["Methane avoidance"],
  },

  // --- GOLD STANDARD ---
  {
    id: "meth-gs-alm",
    code: "GS-ALM",
    registry: "Gold Standard",
    title: "Agricultural Land Management",
    sector: "Agriculture",
    applicableTo: ["Regenerative agriculture", "Soil management"],
    targetProjects: ["Cocoa farms", "Maize farms"],
  },
  {
    id: "meth-gs-soc",
    code: "GS-SOC",
    registry: "Gold Standard",
    title: "Soil Organic Carbon",
    sector: "Agriculture",
    applicableTo: ["Soil carbon projects"],
    targetProjects: ["Agroforestry", "Cashew farms"],
  },
  {
    id: "meth-gs-re",
    code: "GS-RE",
    registry: "Gold Standard",
    title: "Renewable Energy Protocol",
    sector: "Renewable Energy",
    applicableTo: ["Solar", "Wind", "Clean cooking"],
    targetProjects: ["Solar irrigation", "Solar mini-grids"],
  },

  // --- ACR ---
  {
    id: "meth-acr-sep",
    code: "ACR-SEP",
    registry: "ACR",
    title: "Soil Enrichment Protocol",
    sector: "Agriculture",
    applicableTo: ["Regenerative agriculture"],
    targetProjects: ["Cocoa", "Maize"],
  },

  // --- CLIMATE ACTION RESERVE (CAR) ---
  {
    id: "meth-car-ls",
    code: "CAR-LS",
    registry: "CAR",
    title: "Livestock Protocol",
    sector: "Agriculture",
    applicableTo: ["Enteric methane reduction", "Improved manure management"],
    targetProjects: ["Feed additives", "Livestock management"],
  },

  // --- PURO.EARTH ---
  {
    id: "meth-puro-bc",
    code: "PURO-BC",
    registry: "Puro.earth",
    title: "Puro Biochar Methodology",
    sector: "Engineered Removals",
    applicableTo: ["Biochar projects"],
    targetProjects: ["Cocoa husks", "Rice husks"],
  },
];
