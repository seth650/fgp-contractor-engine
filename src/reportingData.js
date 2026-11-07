/**
 * Sample FloorGuard corporate reporting — illustrative CFO pack.
 * Anchored to ~$95M annual revenue assumption (not live ERP).
 * As of Nov 7, 2026.
 */

export const REPORT_AS_OF = "2026-11-07";
export const ANNUAL_REVENUE_TARGET = 95_000_000;
/** YTD through Nov 7 ≈ 85.2% of calendar year */
export const YTD_REVENUE = 81_200_000;
export const PRIOR_YTD_REVENUE = 71_100_000;

export const PERIODS = [
  { id: "ytd", label: "YTD 2026", note: "Jan 1 – Nov 7" },
  { id: "90d", label: "Last 90 days", note: "Aug 9 – Nov 7" },
  { id: "30d", label: "Last 30 days", note: "Oct 8 – Nov 7" },
  { id: "12m", label: "Trailing 12 mo", note: "Nov 2025 – Nov 2026" },
  { id: "fy", label: "FY 2026 plan", note: "Full-year $95M target" },
];

/** Monthly net revenue $k — scales to ~$81.2M YTD / $95M FY. */
export const MONTHLY_SERIES = {
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  liquids: [4200, 4550, 5100, 5800, 6400, 7100, 6900, 7600, 8200, 8800, 3100],
  pigments: [880, 920, 1050, 1180, 1300, 1420, 1380, 1550, 1680, 1800, 620],
  flake: [1600, 1750, 1900, 2200, 2450, 2700, 2550, 2900, 3100, 3400, 1200],
  quartz: [420, 480, 520, 600, 680, 740, 700, 820, 900, 980, 340],
  customs: [280, 320, 360, 400, 480, 550, 520, 600, 680, 740, 260],
  tools: [180, 195, 210, 240, 265, 290, 275, 310, 335, 360, 125],
};

export const SERIES_META = [
  { id: "liquids", label: "Liquids (resin)", color: "#0e1c3a", unit: "$k" },
  { id: "pigments", label: "Pigments", color: "#e23b32", unit: "$k" },
  { id: "flake", label: "Flake / broadcast", color: "#c9a227", unit: "$k" },
  { id: "quartz", label: "Quartz", color: "#2f6fed", unit: "$k" },
  { id: "customs", label: "Custom blends", color: "#157a45", unit: "$k" },
  { id: "tools", label: "Tools & accessories", color: "#5c6b7d", unit: "$k" },
];

export const DEFAULT_SERIES_ON = {
  liquids: true,
  pigments: true,
  flake: true,
  quartz: false,
  customs: true,
  tools: false,
};

/** Widget toggle catalog — main dashboard sections. */
export const DASH_WIDGETS = [
  { id: "kpis", label: "Executive KPIs", group: "Core" },
  { id: "pnl", label: "P&L snapshot", group: "Finance" },
  { id: "cash", label: "Cash & working capital", group: "Finance" },
  { id: "bridge", label: "YoY revenue bridge", group: "Finance" },
  { id: "forecast", label: "Forecast vs actual", group: "Finance" },
  { id: "margins", label: "Margin stack", group: "Finance" },
  { id: "chart", label: "Category volume chart", group: "Commercial" },
  { id: "products", label: "Top products", group: "Commercial" },
  { id: "systems", label: "Top flooring systems", group: "Commercial" },
  { id: "categories", label: "Volume by category", group: "Commercial" },
  { id: "channels", label: "Channel mix", group: "Commercial" },
  { id: "locations", label: "Distributor / geo", group: "Commercial" },
  { id: "ar", label: "AR aging", group: "Finance" },
  { id: "ops", label: "Ops & capacity", group: "Operations" },
];

export const DEFAULT_WIDGETS_ON = Object.fromEntries(DASH_WIDGETS.map((w) => [w.id, true]));

export const DASH_KPIS = [
  {
    id: "revenue",
    label: "Net revenue YTD",
    value: "$81.2M",
    note: "of $95.0M FY plan",
    delta: "+14.2% vs ’25 YTD",
  },
  {
    id: "runrate",
    label: "Annualized run-rate",
    value: "$95.3M",
    note: "exit Nov pace",
    delta: "↔ on plan",
  },
  {
    id: "gm",
    label: "Gross margin",
    value: "41.8%",
    note: "$33.9M gross profit",
    delta: "+80 bps YoY",
  },
  {
    id: "ebitda",
    label: "Adj. EBITDA",
    value: "$14.6M",
    note: "18.0% of YTD rev",
    delta: "+210 bps",
  },
  {
    id: "cash",
    label: "Cash & equivalents",
    value: "$9.4M",
    note: "as of Nov 7",
    delta: "+$1.1M MoM",
  },
  {
    id: "dso",
    label: "DSO / DIO / DPO",
    value: "38 · 52 · 41",
    note: "cash conversion 49 days",
    delta: "−3 days YoY",
  },
  {
    id: "gal",
    label: "Resin gallons moved",
    value: "512k",
    note: "liquids category",
    delta: "+11%",
  },
  {
    id: "jobs",
    label: "Jobs on FGP systems",
    value: "18.4k",
    note: "engine + store POs",
    delta: "+19%",
  },
];

/** Simplified P&L — $M */
export const PNL_ROWS = [
  { id: "rev", label: "Net revenue", ytd: 81.2, prior: 71.1, plan: 80.9 },
  { id: "cogs", label: "COGS", ytd: -47.3, prior: -42.0, plan: -47.0, indent: 1 },
  { id: "gp", label: "Gross profit", ytd: 33.9, prior: 29.1, plan: 33.9, bold: true },
  { id: "opex_s", label: "Sales & marketing", ytd: -8.4, prior: -7.9, plan: -8.6, indent: 1 },
  { id: "opex_g", label: "G&A", ytd: -6.1, prior: -5.8, plan: -6.2, indent: 1 },
  { id: "opex_r", label: "R&D / formula", ytd: -2.2, prior: -1.9, plan: -2.3, indent: 1 },
  { id: "opex_f", label: "Freight & fulfillment", ytd: -4.8, prior: -4.5, plan: -4.7, indent: 1 },
  { id: "ebitda", label: "Adj. EBITDA", ytd: 14.6, prior: 11.3, plan: 14.2, bold: true },
  { id: "da", label: "D&A", ytd: -1.9, prior: -1.7, plan: -1.9, indent: 1 },
  { id: "ebit", label: "Operating income", ytd: 12.7, prior: 9.6, plan: 12.3, bold: true },
  { id: "int", label: "Interest & other", ytd: -0.8, prior: -0.9, plan: -0.8, indent: 1 },
  { id: "tax", label: "Taxes (est.)", ytd: -2.9, prior: -2.1, plan: -2.8, indent: 1 },
  { id: "ni", label: "Net income", ytd: 9.0, prior: 6.6, plan: 8.7, bold: true },
];

export const CASH_ROWS = [
  { label: "Cash & equivalents", value: 9.4, unit: "$M" },
  { label: "Accounts receivable", value: 12.8, unit: "$M" },
  { label: "Inventory (net)", value: 18.6, unit: "$M" },
  { label: "Accounts payable", value: -8.2, unit: "$M" },
  { label: "Net working capital", value: 23.2, unit: "$M", emphasize: true },
  { label: "Revolver drawn", value: 0, unit: "$M" },
  { label: "Undrawn capacity", value: 15.0, unit: "$M" },
];

export const REVENUE_BRIDGE = [
  { label: "’25 YTD", value: 71.1 },
  { label: "Volume", value: 6.4 },
  { label: "Price / mix", value: 3.1 },
  { label: "New SKUs", value: 1.8 },
  { label: "Churn / lost", value: -1.2 },
  { label: "’26 YTD", value: 81.2, total: true },
];

export const FORECAST_MONTHS = [
  { m: "Jul", actual: 11.4, plan: 11.1 },
  { m: "Aug", actual: 12.6, plan: 12.2 },
  { m: "Sep", actual: 13.5, plan: 13.0 },
  { m: "Oct", actual: 14.6, plan: 14.1 },
  { m: "Nov*", actual: 5.4, plan: 5.2 },
  { m: "Dec", actual: null, plan: 13.8 },
];

export const MARGIN_STACK = [
  { label: "Gross margin", value: 41.8, color: "#0e1c3a" },
  { label: "Contribution (after freight)", value: 35.9, color: "#16315f" },
  { label: "EBITDA margin", value: 18.0, color: "#c9a227" },
  { label: "EBIT margin", value: 15.6, color: "#e23b32" },
  { label: "Net margin", value: 11.1, color: "#157a45" },
];

export const CHANNEL_MIX = [
  { name: "Distributor wholesale", amount: 48.7, share: 0.6, delta: "+12%" },
  { name: "Direct contractor / engine", amount: 16.2, share: 0.2, delta: "+28%" },
  { name: "E-comm / web", amount: 9.7, share: 0.12, delta: "+9%" },
  { name: "National accounts", amount: 6.6, share: 0.08, delta: "+6%" },
];

export const AR_AGING = [
  { bucket: "Current", amount: 7.4, share: 0.58 },
  { bucket: "1–30", amount: 3.1, share: 0.24 },
  { bucket: "31–60", amount: 1.4, share: 0.11 },
  { bucket: "61–90", amount: 0.6, share: 0.05 },
  { bucket: "90+", amount: 0.3, share: 0.02 },
];

export const OPS_METRICS = [
  { label: "Plant utilization", value: "87%", note: "Midwest + OH" },
  { label: "OTIF", value: "94.2%", note: "on-time in-full" },
  { label: "Backorder $", value: "$1.1M", note: "↓ from $1.6M" },
  { label: "Active contractors", value: "2,840", note: "engine accounts" },
  { label: "Avg order value", value: "$4,180", note: "wholesale" },
  { label: "Return rate", value: "1.4%", note: "of shipments" },
];

export const TOP_PRODUCTS = [
  { name: "HyperBOND 3 gal", category: "Liquids", gal: 138200, revenue: 8980000, trend: 12 },
  { name: "Aspartic 85 Slow Go (Low Odor) 2 gal", category: "Liquids", gal: 72150, revenue: 6494000, trend: 18 },
  { name: 'Decorative Flake 1/4" Domino', category: "Flake", lbs: 964000, revenue: 2890000, trend: 9 },
  { name: "E-Poly Pigment — Sable Gray", category: "Pigments", units: 160500, revenue: 2408000, trend: 7 },
  { name: "DT-454 Clear 3 gal", category: "Liquids", gal: 51300, revenue: 3591000, trend: 4 },
  { name: "MV2112 3 gal", category: "Liquids", gal: 30900, revenue: 3708000, trend: 22 },
  { name: "HyperBOND Turbo 3 gal", category: "Liquids", gal: 39600, revenue: 2574000, trend: 31 },
  { name: "E-Poly Pigment — Dover Beige", category: "Pigments", units: 117000, revenue: 1755000, trend: 5 },
  { name: "Aspartic 85 Fast (Low Odor) 2 gal", category: "Liquids", gal: 23850, revenue: 2147000, trend: 14 },
  { name: "Custom flake blend (jobsite)", category: "Customs", lbs: 214500, revenue: 858000, trend: 27 },
];

export const TOP_SYSTEMS = [
  { name: "FGP Flake · Outdoor residential", code: "FLK-OD-RES", jobs: 6310, revenue: 30900000, share: 0.34 },
  { name: "FGP Flake · Indoor residential", code: "FLK-ID-RES", jobs: 4575, revenue: 21600000, share: 0.24 },
  { name: "FGP Solid Color (EZ Clean)", code: "SC-ID-EZ", jobs: 2385, revenue: 11550000, share: 0.13 },
  { name: "FGP Metallic", code: "METALLIC-ID", jobs: 1470, revenue: 9900000, share: 0.11 },
  { name: "Custom / hybrid builds", code: "CUSTOM", jobs: 1155, revenue: 7350000, share: 0.08 },
  { name: "FGP Quartz commercial", code: "QUARTZ-ID", jobs: 840, revenue: 5700000, share: 0.06 },
  { name: "Grind & Seal", code: "GRIND-SEAL", jobs: 660, revenue: 3150000, share: 0.04 },
];

export const CATEGORY_VOLUME = [
  { id: "liquids", label: "Liquids", detail: "Epoxy · polyurea · aspartic · MVB", amount: 47100000, volumeLabel: "512k gal", color: "#0e1c3a" },
  { id: "pigments", label: "Pigments", detail: "E-Poly stock + nonstock", amount: 7350000, volumeLabel: "465k jars", color: "#e23b32" },
  { id: "flake", label: "Flake", detail: "1/4 · MarbleFlake · Hybrid", amount: 16050000, volumeLabel: "3.1M lb", color: "#c9a227" },
  { id: "quartz", label: "Quartz", detail: "Broadcast kits", amount: 5400000, volumeLabel: "645k lb", color: "#2f6fed" },
  { id: "customs", label: "Customs", detail: "Blends · special builds", amount: 4050000, volumeLabel: "1,155 jobs", color: "#157a45" },
  { id: "tools", label: "Tools & accessories", detail: "Spikes · rollers · AO", amount: 2325000, volumeLabel: "—", color: "#5c6b7d" },
];

export const LOCATION_YTD = [
  { name: "FloorGuard Midwest", amount: 21120000, share: 0.26 },
  { name: "FloorGuard Chicago", amount: 14610000, share: 0.18 },
  { name: "FloorGuard Pittsburgh", amount: 12180000, share: 0.15 },
  { name: "FloorGuard Ohio", amount: 9744000, share: 0.12 },
  { name: "FloorGuard Indiana", amount: 7308000, share: 0.09 },
  { name: "Other distributors", amount: 16200000, share: 0.2 },
];

export const DASH_PREFS_KEY = "fgp-corp-dashboard-prefs-v2";

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
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return money(n);
}

export function moneyM(n, digits = 1) {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(digits)}M`;
}
