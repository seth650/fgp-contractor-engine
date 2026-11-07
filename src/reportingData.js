/**
 * Sample FloorGuard network reporting — not live ERP numbers.
 * Anchored loosely to public context: FloorGuard ~$15M historical e-comm product mix,
 * U.S. resinous flooring growth, Midwest distributor model, as of Nov 7, 2026.
 */

export const REPORT_AS_OF = "2026-11-07";

export const PERIODS = [
  { id: "ytd", label: "YTD 2026", note: "Jan 1 – Nov 7" },
  { id: "90d", label: "Last 90 days", note: "Aug 9 – Nov 7" },
  { id: "30d", label: "Last 30 days", note: "Oct 8 – Nov 7" },
  { id: "12m", label: "Trailing 12 mo", note: "Nov 2025 – Nov 2026" },
];

/** Monthly network wholesale $ through the engine (sample). */
export const MONTHLY_SERIES = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  liquids: [420, 455, 510, 580, 640, 710, 690, 760, 820, 880, 310], // $k
  pigments: [88, 92, 105, 118, 130, 142, 138, 155, 168, 180, 62],
  flake: [160, 175, 190, 220, 245, 270, 255, 290, 310, 340, 120],
  quartz: [42, 48, 52, 60, 68, 74, 70, 82, 90, 98, 34],
  customs: [28, 32, 36, 40, 48, 55, 52, 60, 68, 74, 26],
};

export const SERIES_META = [
  { id: "liquids", label: "Liquids (resin)", color: "#0e1c3a", unit: "$k" },
  { id: "pigments", label: "Pigments", color: "#e23b32", unit: "$k" },
  { id: "flake", label: "Flake / broadcast", color: "#c9a227", unit: "$k" },
  { id: "quartz", label: "Quartz", color: "#2f6fed", unit: "$k" },
  { id: "customs", label: "Custom blends", color: "#157a45", unit: "$k" },
];

export const DEFAULT_SERIES_ON = {
  liquids: true,
  pigments: true,
  flake: true,
  quartz: false,
  customs: true,
};

/** Top SKUs YTD — sample wholesale through distributors. */
export const TOP_PRODUCTS = [
  { name: "HyperBOND 3 gal", category: "Liquids", gal: 18420, revenue: 1197300, trend: 12 },
  { name: "Aspartic 85 Slow Go (Low Odor) 2 gal", category: "Liquids", gal: 9620, revenue: 865800, trend: 18 },
  { name: 'Decorative Flake 1/4" Domino', category: "Flake", lbs: 128400, revenue: 385200, trend: 9 },
  { name: "E-Poly Pigment — Sable Gray", category: "Pigments", units: 21400, revenue: 321000, trend: 7 },
  { name: "DT-454 Clear 3 gal", category: "Liquids", gal: 6840, revenue: 478800, trend: 4 },
  { name: "MV2112 3 gal", category: "Liquids", gal: 4120, revenue: 494400, trend: 22 },
  { name: "HyperBOND Turbo 3 gal", category: "Liquids", gal: 5280, revenue: 343200, trend: 31 },
  { name: "E-Poly Pigment — Dover Beige", category: "Pigments", units: 15600, revenue: 234000, trend: 5 },
  { name: "Aspartic 85 Fast (Low Odor) 2 gal", category: "Liquids", gal: 3180, revenue: 286200, trend: 14 },
  { name: "Custom flake blend (jobsite)", category: "Customs", lbs: 28600, revenue: 114400, trend: 27 },
];

/** Flooring systems sold / quoted — includes customs. */
export const TOP_SYSTEMS = [
  { name: "FGP Flake · Outdoor residential", code: "FLK-OD-RES", jobs: 842, revenue: 4120000, share: 0.34 },
  { name: "FGP Flake · Indoor residential", code: "FLK-ID-RES", jobs: 610, revenue: 2880000, share: 0.24 },
  { name: "FGP Solid Color (EZ Clean)", code: "SC-ID-EZ", jobs: 318, revenue: 1540000, share: 0.13 },
  { name: "FGP Metallic", code: "METALLIC-ID", jobs: 196, revenue: 1320000, share: 0.11 },
  { name: "Custom / hybrid builds", code: "CUSTOM", jobs: 154, revenue: 980000, share: 0.08 },
  { name: "FGP Quartz commercial", code: "QUARTZ-ID", jobs: 112, revenue: 760000, share: 0.06 },
  { name: "Grind & Seal", code: "GRIND-SEAL", jobs: 88, revenue: 420000, share: 0.04 },
];

export const CATEGORY_VOLUME = [
  { id: "liquids", label: "Liquids", detail: "Epoxy · polyurea · aspartic · MVB", amount: 6280000, volumeLabel: "68.4k gal", color: "#0e1c3a" },
  { id: "pigments", label: "Pigments", detail: "E-Poly stock + nonstock", amount: 980000, volumeLabel: "62k jars", color: "#e23b32" },
  { id: "flake", label: "Flake", detail: "1/4 · MarbleFlake · Hybrid", amount: 2140000, volumeLabel: "412k lb", color: "#c9a227" },
  { id: "quartz", label: "Quartz", detail: "Broadcast kits", amount: 720000, volumeLabel: "86k lb", color: "#2f6fed" },
  { id: "customs", label: "Customs", detail: "Blends · special builds", amount: 540000, volumeLabel: "154 jobs", color: "#157a45" },
  { id: "tools", label: "Tools & accessories", detail: "Spikes · rollers · AO", amount: 310000, volumeLabel: "—", color: "#5c6b7d" },
];

export const LOCATION_YTD = [
  { name: "FloorGuard Midwest", amount: 2842000, share: 0.26 },
  { name: "FloorGuard Chicago", amount: 1984000, share: 0.18 },
  { name: "FloorGuard Pittsburgh", amount: 1620000, share: 0.15 },
  { name: "FloorGuard Ohio", amount: 1288000, share: 0.12 },
  { name: "FloorGuard Indiana", amount: 986000, share: 0.09 },
  { name: "Other distributors", amount: 2180000, share: 0.20 },
];

export const DASH_KPIS = [
  { id: "revenue", label: "Network wholesale YTD", value: "$10.9M", note: "sample · through Nov 7", delta: "+14% vs ’25 YTD" },
  { id: "gal", label: "Resin gallons moved", value: "68.4k", note: "liquids category", delta: "+11%" },
  { id: "jobs", label: "Jobs quoted on FGP systems", value: "2,320", note: "engine + store POs", delta: "+19%" },
  { id: "custom", label: "Custom mix share", value: "8%", note: "of system revenue", delta: "+2 pts" },
];

export const DASH_PREFS_KEY = "fgp-corp-dashboard-prefs-v1";

export function loadDashPrefs() {
  try {
    const raw = localStorage.getItem(DASH_PREFS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDashPrefs(prefs) {
  try {
    localStorage.setItem(DASH_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function moneyCompact(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return money(n);
}
