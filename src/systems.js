/** FloorGuard Contractor Engine — calculation core (ECOS-parity kit math).
 * No React. Layer formulas and 1.10 gal buffer match ECOS App.jsx.
 */

import { PRODUCTS, resolveLayerProductKey } from "./products.js";

const DEFAULT_POLYASPARTIC_TOPCOAT_KEY = "aspartic85";

/** App membership (what they pay Stripe for) — separate from store buying tier. */
export const MEMBERSHIP_TIERS = {
  free: { label: "Free", blurb: "Outdoor + indoor residential flake" },
  tier1: { label: "Calculator", blurb: "All 8 systems · $49/mo" },
  tier2: { label: "Estimator", blurb: "Customer quotes · $149/mo" },
};

/**
 * Contractor buying tier (store volume / FGP relationship) — NOT membership.
 * Bronze / Silver / Gold replaces the older MSRP/Small/Tier2/Preferred labels in the FGP UI.
 */
export const BUYING_TIERS = {
  bronze: { label: "Bronze", blurb: "Entry buying rate", mult: 1.0, legacyKey: "msrp" },
  silver: { label: "Silver", blurb: "Volume partner", mult: 0.9, legacyKey: "tier2" },
  gold: { label: "Gold", blurb: "Preferred volume", mult: 0.85, legacyKey: "preferred" },
};

/** @deprecated Prefer BUYING_TIERS for FGP UI; kept for kit price sheet keys. */
export const TIERS = {
  msrp: { label: "Bronze (list)", mult: 1.0 },
  small: { label: "Small Buyer (legacy 5%)", mult: 0.95 },
  tier2: { label: "Silver (legacy 10%)", mult: 0.9 },
  preferred: { label: "Gold (legacy 15%)", mult: 0.85 },
};

/** Selectable body/base chemistries — free users may override system defaults. */
export const BASE_PRODUCT_OPTIONS = [
  { value: "hyperbond", label: "HyperBOND", note: "Default when moisture is none", family: "epoxy" },
  { value: "hyperbond_turbo", label: "HyperBOND Turbo", note: "Default for mild / moderate moisture", family: "epoxy" },
  { value: "mv2112", label: "MV2112", note: "Default for heavy moisture · FGP CYA primer", family: "epoxy" },
  { value: "polyurea", label: "Polyurea", note: "Outdoor UV path · pick speed", family: "polyurea" },
  { value: "dt454_clear", label: "DT-454", note: "Standard DT-454 clear", family: "epoxy" },
  { value: "dt454_turbo", label: "DT-454 Turbo", note: "Faster DT-454", family: "epoxy" },
  { value: "hyperrez_uv", label: "HyperREZ UV", note: "UV-stable epoxy option", family: "epoxy" },
];

export const TOPCOAT_OPTIONS = [
  { value: "aspartic85", label: "Aspartic 85 Slow Go (Low Odor)", note: "Low odor polyaspartic" },
  { value: "aspartic85_fast_low", label: "Aspartic 85 Fast (Low Odor)", note: "Faster low odor polyaspartic" },
  { value: "dt454_clear", label: "DT-454 Clear", note: "Indoor classic clear" },
  { value: "hyperrez_uv", label: "HyperREZ UV", note: "UV-stable clear" },
];

/** Moisture → suggested base product (user can still override). */
export function suggestBaseProductForMoisture(moisture) {
  if (moisture === "high") return "mv2112";
  if (moisture === "moderate") return "hyperbond_turbo";
  return "hyperbond";
}

export function resolvePolyureaKey(speed = "slow") {
  if (speed === "fast") return "polyurea_fast";
  if (speed === "medium") return "polyurea_med";
  return "polyurea_slow";
}

export function resolveBaseProductKey(baseProduct, speed = "slow") {
  if (baseProduct === "polyurea") return resolvePolyureaKey(speed);
  return baseProduct || "hyperbond";
}

const ACCESSORY_TIER_MULTS = {
  msrp: 1.0,
  small: 1.0,
  tier2: 1.0,
  preferred: 0.95,
};

export const LOCATION_OPTIONS = [
  { value: "exterior", label: "Outdoor", sub: "Garage · Patio · Drive (Garage = Outdoor)" },
  { value: "interior", label: "Indoor", sub: "Basement · Shop · Commercial" },
];

export const FINISH_OPTIONS = [
  { value: "flake", label: "Flake" },
  { value: "solid", label: "Solid Color", locked: true },
  { value: "solid_tex", label: "Solid + Texture", locked: true },
  { value: "metallic", label: "Metallic", locked: true },
  { value: "quartz", label: "Quartz", locked: true },
  { value: "grind_seal", label: "Grind & Seal", locked: true },
];

/** Safety pigments — confirm before use on flake / quartz (not solid). */
export const SAFETY_BASE_COLORS = new Set(["Safety Yellow", "Safety Red", "Ford Blue"]);

export const FLAKE_CATEGORIES = [
  {
    id: "quarter",
    label: '1/4" Flake',
    colors: [
      { value: "Gravel", hex: "#7F8790", recommendedBase: "Sable Gray" },
      { value: "Domino", hex: "#2D2F33", recommendedBase: "Sable Gray" },
      { value: "Creekbed", hex: "#8B7D6B", recommendedBase: "Dover Beige" },
      { value: "Cabin Fever", hex: "#6B5A48", recommendedBase: "Sable Gray" },
      { value: "Tidal Wave", hex: "#3A5D76", recommendedBase: "Sable Gray" },
      { value: "Shoreline", hex: "#9FA9B2", recommendedBase: "Dover Beige" },
      { value: "Wombat", hex: "#5A5348", recommendedBase: "Medium Gray" },
      { value: "Orbit", hex: "#4A5560", recommendedBase: "Sable Gray" },
      { value: "Nightfall", hex: "#1E2530", recommendedBase: "Medium Gray" },
      { value: "Coyote", hex: "#8A6F4E", recommendedBase: "Sable Gray" },
      { value: "Outback", hex: "#A8906C", recommendedBase: "Dover Beige" },
      { value: "Madras", hex: "#9C7A5B", recommendedBase: "Dover Beige" },
      { value: "Stony Creek", hex: "#7A8478", recommendedBase: "Sable Gray" },
      { value: "Stonewash", hex: "#8E97A0", recommendedBase: "Sable Gray" },
      { value: "Stargazer", hex: "#3E4654", recommendedBase: "Sable Gray" },
      { value: "Stonehenge", hex: "#6E6A62", recommendedBase: "Sable Gray" },
      { value: "Loon", hex: "#B7B0A0", recommendedBase: "Dover Beige" },
    ],
  },
  {
    id: "marble",
    label: "MarbleFlake™",
    colors: [
      { value: "Oahu Brown", hex: "#6B4E3A", recommendedBase: "Dover Beige" },
      { value: "Lanai Gray", hex: "#8A8F93", recommendedBase: "Dover Beige" },
      { value: "Dolerite", hex: "#5C6168", recommendedBase: "Sable Gray" },
      { value: "Pumice", hex: "#C4BBAE", recommendedBase: "Dover Beige" },
      { value: "Basalt", hex: "#3A3D42", recommendedBase: "Sable Gray" },
      { value: "Carbon", hex: "#1A1A1C", recommendedBase: "Black" },
      { value: "Obsidian", hex: "#2B2E33", recommendedBase: "Dover Beige" },
    ],
  },
  {
    id: "hybrid",
    label: "Hybrid Flake",
    colors: [
      { value: "Agate", hex: "#7D858C", recommendedBase: "Sable Gray" },
      { value: "Claystone", hex: "#A89278", recommendedBase: "Dover Beige" },
      { value: "Shale", hex: "#5E646A", recommendedBase: "Sable Gray" },
      { value: "Acadia", hex: "#B09A7A", recommendedBase: "Dover Beige" },
      { value: "Yukon", hex: "#6F7880", recommendedBase: "Sable Gray" },
    ],
  },
];

/** Flat list of all stocked flake options (all categories). */
export const STOCKED_COLORS = FLAKE_CATEGORIES.flatMap((cat) =>
  cat.colors.map((c) => ({ ...c, category: cat.id, categoryLabel: cat.label }))
);

export const MAX_FREE_JOBS = 2;

export const BASE_COAT_COLOR_OPTIONS = [
  { value: "White", hex: "#f5f5eb", textColor: "#111111" },
  { value: "Dover Beige", hex: "#d6cdb7", textColor: "#111111" },
  { value: "Tan", hex: "#c4aa7b", textColor: "#111111" },
  { value: "Mocha", hex: "#ac885e", textColor: "#111111" },
  { value: "Tile Brown", hex: "#562d18", textColor: "#ffffff" },
  { value: "Sable Gray", hex: "#c9cacc", textColor: "#111111" },
  { value: "Medium Gray", hex: "#8d8f8f", textColor: "#111111" },
  { value: "Metal Gray", hex: "#4e555e", textColor: "#ffffff" },
  { value: "Black", hex: "#040606", textColor: "#ffffff" },
  { value: "Safety Yellow", hex: "#e6c228", textColor: "#111111" },
  { value: "Safety Red", hex: "#be4735", textColor: "#ffffff" },
  { value: "Ford Blue", hex: "#335789", textColor: "#ffffff" },
];

export const FREE_UNLOCKED_SYSTEMS = new Set(["FLK-OD-RES", "FLK-ID-RES"]);
export const FREE_UNLOCKED_FINISHES = new Set(["flake"]);

/** @deprecated Prefer FREE_UNLOCKED_SYSTEMS; kept for outdoor-only callers. */
export const FREE_SYSTEM_KEY = "FLK-OD-RES";

// ─── SYSTEM LAYER HELPERS (add-ons) ─────────────────────────────────────────

function pushCrackRepairAddOn(items, sf, opts, odorSensitive = false) {
  if (!opts.hasCracks) return;
  if (odorSensitive && opts.odorConcern) {
    items.push({
      key: "hypercure",
      gals: 0,
      label: "Crack Repair — HyperCURE",
      qty: sf / 2000,
      unit: "kit",
      notes:
        "Low-odor 100% solids epoxy (fumed silica thickened) · est. ~0.5 kit per 1,000 ft² (whole 0.5 gal kits only — rounds up)",
    });
    return;
  }
  items.push({
    key: "patch_pro_10x",
    gals: 0,
    label: "Crack Repair",
    qty: sf / 2000,
    unit: "kit",
    notes: "Est. ~0.5 kit per 1,000 ft² (PO: whole 2 gal kits only — rounds up)",
  });
}

function pushMoistureMvbAddOn(items, sf, opts, sqFtPerGal = 95) {
  if (opts.moisture === "high") {
    items.push({
      key: "mv2112",
      gals: sf / sqFtPerGal,
      label: "MVB add-on — MV2112",
      notes: `${sqFtPerGal} ft²/gal · full MVB when moisture risk is high`,
    });
  } else if (opts.moisture === "moderate") {
    items.push({
      key: "hyperprime_mvb",
      gals: sf / sqFtPerGal,
      label: "MVB add-on — HyperPrime MVB",
      notes: `${sqFtPerGal} ft²/gal · may be pigmented; need not be applied neat`,
    });
  }
}

// ─── SYSTEM DEFINITIONS ──────────────────────────────────────────────────────

function coverageForBase(baseProduct) {
  if (baseProduct === "polyurea") return 190;
  if (baseProduct === "mv2112") return 100;
  if (baseProduct === "dt454_turbo" || baseProduct === "dt454_clear") return 170;
  if (baseProduct === "hyperrez_uv") return 170;
  return 160; // HyperBOND / HyperBOND Turbo
}

function coverageForTopcoat(topcoat) {
  if (topcoat === "dt454_clear") return 110;
  if (topcoat === "hyperrez_uv") return 170;
  if (topcoat === "aspartic85_fast_low") return 120;
  return 120; // aspartic85 slow low odor
}

function baseLayerLabel(baseProduct) {
  const opt = BASE_PRODUCT_OPTIONS.find((o) => o.value === baseProduct);
  return `Basecoat — ${opt?.label || baseProduct}`;
}

function topcoatLayerLabel(topcoat) {
  const opt = TOPCOAT_OPTIONS.find((o) => o.value === topcoat);
  return `Final Clear Topcoat — ${opt?.label || topcoat}`;
}

/** Shared flake build used by outdoor + indoor residential free systems. */
function buildSelectableFlakeLayers(sf, opts, defaults) {
  const moisture = opts.moisture || "none";
  const baseProduct = opts.baseProduct || suggestBaseProductForMoisture(moisture) || defaults.baseProduct;
  const topcoat = opts.topcoatProduct || defaults.topcoatProduct;
  const speed = opts.speed || "slow";
  const baseKey = resolveBaseProductKey(baseProduct, speed);
  const baseRate = coverageForBase(baseProduct);
  const topRate = coverageForTopcoat(topcoat);
  const items = [];

  if (opts.hasCracks) {
    items.push({
      key: "patch_pro_10x",
      gals: 0,
      label: "Crack/Joint Repair",
      qty: sf / 2000,
      unit: "kit",
      notes: "Est. ~0.5 kit per 1,000 ft² joint fill (PO: whole 2 gal kits only — rounds up)",
    });
  }

  items.push({
    key: baseKey,
    gals: sf / baseRate,
    label: baseLayerLabel(baseProduct),
    notes:
      baseProduct === "mv2112"
        ? `${baseRate} ft²/gal · FGP moisture CYA primer/base`
        : baseProduct === "polyurea"
          ? `${baseRate} ft²/gal · 2A:1B · ribbon/roll · speed ${speed}`
          : `${baseRate} ft²/gal · pigmented with E-Poly`,
  });

  if (baseProduct !== "mv2112") {
    items.push({
      key: "epoly_pigment",
      gals: (sf / baseRate) * 0.1,
      label: "E-Poly Pigment",
      notes: "+10% total mix volume",
    });
  }

  items.push({
    key: "flake_14",
    lbs: sf / 10,
    label: 'Decorative Flake 1/4"',
    notes: "10–13 ft²/lb · broadcast to rejection",
  });

  const topcoatKey =
    topcoat === "aspartic85"
      ? DEFAULT_POLYASPARTIC_TOPCOAT_KEY
      : topcoat === "aspartic85_fast_low"
        ? "aspartic85_fast_low"
        : topcoat;
  items.push({
    key: topcoatKey,
    gals: sf / topRate,
    label: topcoatLayerLabel(topcoat),
    notes: `${topRate} ft²/gal planning rate`,
  });

  if (opts.steps > 0) {
    items.push({
      key: "silica_sand",
      lbs: opts.steps * 2,
      label: "Traction Sand (Steps)",
      notes: "Required on all stair treads",
    });
  }

  return items;
}

export const SYSTEMS = {
  "FLK-OD-RES": {
    label: "Flake, Outdoor Residential",
    code: "FLK-OD-RES",
    priceRange: "$6–8/ft²",
    warnings: ["UV stable system — traction required on all steps, wet areas, sloped areas"],
    cutawayId: "FLK-OD-RES",
    layers: (sf, opts) =>
      buildSelectableFlakeLayers(sf, opts, {
        baseProduct: "hyperbond",
        topcoatProduct: "aspartic85",
      }),
  },
  "FLK-ID-RES": {
    label: "Flake, Indoor Residential",
    code: "FLK-ID-RES",
    priceRange: "$6–8/ft²",
    warnings: [
      "Non-UV stable unless you switch topcoat/base to a UV package",
      "Heavy moisture defaults to MV2112 base — FGP CYA path",
    ],
    cutawayId: "FLK-ID-RES",
    layers: (sf, opts) =>
      buildSelectableFlakeLayers(sf, opts, {
        baseProduct: "hyperbond",
        topcoatProduct: "dt454_clear",
      }),
  },
  "FLK-ID-COM": {
    label: "Flake, Indoor Commercial",
    code: "FLK-ID-COM",
    priceRange: "$8–12/ft²",
    warnings: [
      "Non-UV stable",
      "Traffic topcoat (E-Z Top 85) included — higher wear protection",
      "Moderate/high moisture → MVB add-on",
    ],
    layers: (sf, opts) => {
      const items = [];
      pushCrackRepairAddOn(items, sf, opts);
      pushMoistureMvbAddOn(items, sf, opts, 95);
      items.push({
        key: "dt454_turbo",
        gals: sf / 170,
        label: "Basecoat — DT-454 Clear (Turbo)",
        notes: "170 ft²/gal · 2:1",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 170) * 0.1,
        label: "E-Poly Pigment",
        notes: "+10% total mix volume",
      });
      items.push({
        key: "flake_14",
        lbs: sf / 10,
        label: 'Decorative Flake 1/4"',
        notes: "10–13 ft²/lb",
      });
      items.push({
        key: "dt454_clear",
        gals: sf / 110,
        label: "Grout Coat — DT-454 Clear",
        notes: "110–140 ft²/gal · 2:1",
      });
      items.push({
        key: "ez_top_85",
        gals: sf / 600,
        label: "Traffic Topcoat — E-Z Top 85",
        notes: "600 ft²/gal min · 1.5 lb/gal COM wear",
      });
      return items;
    },
  },
  "METALLIC-ID": {
    label: "Metallic, Indoor",
    code: "METALLIC-ID",
    priceRange: "$12–20/ft²",
    warnings: [
      "Artistic system — consult Metallic Recipe Book for pigment",
      "🚨 Moisture: critical — MVB required if ANY risk present",
      '"This is art, not a work floor"',
    ],
    layers: (sf, opts) => {
      const items = [];
      pushCrackRepairAddOn(items, sf, opts, true);
      if (opts.moisture === "high" || opts.moisture === "moderate") {
        items.push({ key: "mv2112", gals: sf / 95, label: "MVB — MV2112", notes: "95 ft²/gal · 2:1" });
      } else {
        const primerTint = String(opts.metallicPrimerTint || "Gray").trim();
        const tintIsClear = primerTint.toLowerCase() === "clear";
        items.push({
          key: tintIsClear ? "hyperprime_mvb" : "hyperprime_mvb_pig",
          gals: sf / 200,
          label: `Primer — HyperPRIME MVB (${tintIsClear ? "Clear" : `Pigmented ${primerTint}`})`,
          notes: "200 ft²/gal · used as first primer layer unless moisture is moderate/high",
        });
      }
      items.push({
        key: "dt454_turbo",
        gals: sf / 170,
        label: "Basecoat — DT-454 Clear (Turbo)",
        notes: "170 ft²/gal · 2:1",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 170) * 0.1,
        label: "E-Poly Pigment",
        notes: "+10% total mix volume",
      });
      const marbleMaxGals = sf / 40;
      items.push({
        key: "marblemax",
        gals: marbleMaxGals,
        label: "Artistic Layer — MarbleMax",
        notes: "40 ft²/gal planning rate · 2:1",
      });
      items.push({
        key: "metallic_mica_4oz",
        gals: 0,
        qty: marbleMaxGals * (4 / 3),
        label: "Metallic Pigment (Mica) — 4oz jars",
        notes: "16 oz mica per 3 gal MarbleMax (4 jars per 3 gal)",
      });
      const topcoatGals = sf / 600;
      items.push({
        key: "ez_top_85",
        gals: topcoatGals,
        label: "Topcoat — EZ Top 85 (MCU 85 mfg)",
        notes: "600 ft²/gal min",
      });
      items.push({
        key: "wearmax_3lb",
        lbs: topcoatGals * 3,
        label: "WearMax Additive",
        notes: "3 lb/gal EZ Top 85 · 500–600 ft²/gal target",
      });
      return items;
    },
  },
  "QUARTZ-ID-COM": {
    label: "Epoxy Quartz, Indoor Commercial",
    code: "QUARTZ-ID-COM",
    priceRange: "$10–12/ft²",
    warnings: [
      "Double broadcast system",
      "Slip resistance required — safety + decorative + durability",
      "Broadcast coat 1 follows moisture: none → pigmented HyperBond · moderate → HyperPrime MVB · high → MV2112",
    ],
    layers: (sf, opts) => {
      const items = [];
      pushCrackRepairAddOn(items, sf, opts);
      const bc1Rate = 160;
      const bc1Gals = sf / bc1Rate;
      if (opts.moisture === "high") {
        items.push({
          key: "mv2112",
          gals: bc1Gals,
          label: "Broadcast Coat 1 — MV2112",
          notes: "160 ft²/gal · 2:1 · E-Poly +10%",
        });
      } else if (opts.moisture === "moderate") {
        items.push({
          key: "hyperprime_mvb",
          gals: bc1Gals,
          label: "Broadcast Coat 1 — HyperPrime MVB",
          notes: "160 ft²/gal · 2:1 · E-Poly +10%",
        });
      } else {
        items.push({
          key: "hyperbond",
          gals: bc1Gals,
          label: "Broadcast Coat 1 — Pigmented HyperBond",
          notes: "160 ft²/gal · 2:1 · E-Poly +10%",
        });
      }
      items.push({
        key: "epoly_pigment",
        gals: (sf / bc1Rate) * 0.1,
        label: "E-Poly Pigment",
        notes: "+10% total mix volume",
      });
      items.push({
        key: "quartz_agg",
        lbs: sf * 1.0,
        label: "Colored Quartz Aggregate (Broadcast 1)",
        notes: "1.0 lb/ft² conservative for double broadcast",
      });
      items.push({
        key: "dt454_turbo",
        gals: sf / 90,
        label: "Broadcast Coat 2 — DT-454 Clear (Turbo)",
        notes: "90–120 ft²/gal · 2:1",
      });
      items.push({
        key: "quartz_agg",
        lbs: sf * 1.0,
        label: "Colored Quartz Aggregate (Broadcast 2)",
        notes: "second broadcast · 1.0 lb/ft² conservative",
      });
      items.push({
        key: "dt454_turbo",
        gals: sf / 90,
        label: "Clear Topcoat — DT-454 Clear (Turbo)",
        notes: "90–130 ft²/gal · 2:1 · (will need 2nd top coat if customer requires smoother finish)",
      });
      return items;
    },
  },
  "SC-ID-EZ-CLEAN": {
    label: "Solid Colored, Indoor",
    code: "SC-ID-EZ CLEAN",
    priceRange: "$5–8/ft²",
    warnings: ["Non-UV stable", "Moderate/high moisture → MVB add-on replaces bond primer"],
    layers: (sf, opts) => {
      const items = [];
      pushCrackRepairAddOn(items, sf, opts, true);
      if (opts.moisture === "high" || opts.moisture === "moderate") {
        pushMoistureMvbAddOn(items, sf, opts, 95);
      } else {
        items.push({
          key: "hydroprime_40",
          gals: sf / 300,
          label: "Primer / Bond Coat — HydroPrime 40",
          notes: "250–350 ft²/gal · squeegee/roll · tint EpoTint-WB (1 pt / 2 gal mixed)",
        });
      }
      items.push({
        key: "dt454_turbo",
        gals: sf / 155,
        label: "Body Coat — DT-454 Clear (Turbo)",
        notes: "140–170 ft²/gal · 2:1 · notch squeegee 8–12 mil WFT",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 155) * 0.1,
        label: "E-Poly Pigment",
        notes: "+10% total mix volume (body coat)",
      });
      items.push({
        key: "ez_top_85",
        gals: sf / 600,
        label: "Topcoat — EZ Top 85 (Low Odor) — MCU 85 (manufacturer)",
        notes: "600 ft²/gal min · single component · add silica wear per RES/COM spec",
      });
      return items;
    },
  },
  "SC-ID-TEX": {
    label: "Solid Colored, Indoor Textured",
    code: "SC-ID-TEX",
    priceRange: "$5–8/ft²",
    warnings: ["Grip + durability over appearance", "Sand broadcast to refusal — 50 lbs per 100 ft²"],
    layers: (sf, opts) => {
      const items = [];
      pushCrackRepairAddOn(items, sf, opts, true);
      items.push({
        key: "dt454_turbo",
        gals: sf / 160,
        label: "Base Coat — DT-454 Clear (Turbo)",
        notes: "160 ft²/gal · 2:1",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 160) * 0.1,
        label: "E-Poly Pigment",
        notes: "+10% total mix volume",
      });
      items.push({
        key: "dt454_turbo",
        gals: sf / 170,
        label: "Broadcast Coat — DT-454 Clear (Turbo)",
        notes: "170 ft²/gal · 2:1",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 170) * 0.1,
        label: "E-Poly Pigment (Broadcast coat)",
        notes: "+10% total mix volume",
      });
      items.push({
        key: "silica_sand",
        lbs: sf * 0.5,
        label: "20/40 Mesh Silica Sand",
        notes: "50 lbs per 100 ft² · broadcast to refusal",
      });
      items.push({
        key: "dt454_turbo",
        gals: sf / 75,
        label: "Final Topcoat — DT-454 Pigmented (Turbo)",
        notes: "75–120 ft²/gal · backroll only",
      });
      items.push({
        key: "epoly_pigment",
        gals: (sf / 75) * 0.1,
        label: "E-Poly Pigment (Topcoat)",
        notes: "+10% total mix volume",
      });
      return items;
    },
  },
  "GRIND-SEAL": {
    label: "Grind & Seal",
    code: "GRIND & SEAL",
    priceRange: "$4–6/ft²",
    warnings: [
      "Cracks/defects NOT repaired by design",
      "Function only — not decorative",
      '"This is function, not transformation"',
    ],
    layers: (sf, _opts) => {
      const items = [];
      items.push({
        key: "dt454_turbo",
        gals: sf / 170,
        label: "Prime/Base — DT-454 Clear (Turbo)",
        notes: "170 ft²/gal · 2:1 · squeegee/roll",
      });
      const topcoatGals = sf / 600;
      items.push({
        key: "ez_top_85",
        gals: topcoatGals,
        label: "Topcoat — E-Z Top 85",
        notes: "600 ft²/gal min · includes WearMax additive per ET standard",
      });
      items.push({
        key: "wearmax_3lb",
        lbs: topcoatGals * 3,
        label: "WearMax Additive",
        notes: "3 lb/gal E-Z Top 85 · wear resistance AO",
      });
      return items;
    },
  },
};

// ─── PRICING / KIT MATH ──────────────────────────────────────────────────────

function usesAccessoryPricingModel(productKey = "") {
  const product = PRODUCTS[productKey];
  if (product?.pricingModel === "accessory") return true;
  return (
    productKey.startsWith("epoly_pigment_") ||
    productKey.startsWith("tool_") ||
    productKey.startsWith("accessory_")
  );
}

function getTierMultiplierForProduct(productKey, tierKey) {
  if (usesAccessoryPricingModel(productKey)) {
    return ACCESSORY_TIER_MULTS[tierKey] ?? 1;
  }
  return TIERS[tierKey]?.mult ?? 1;
}

export function getKitTierPrice(kit, productKey, tierKey) {
  if (kit?.tierPrices && typeof kit.tierPrices[tierKey] === "number") {
    return +kit.tierPrices[tierKey].toFixed(2);
  }
  const tierMult = getTierMultiplierForProduct(productKey, tierKey);
  return +((kit?.msrp || 0) * tierMult).toFixed(2);
}

export function calcKits(productKey, galsNeeded, lbsNeeded, qtyNeeded) {
  const prod = PRODUCTS[productKey];
  if (!prod) return [];
  if (lbsNeeded !== undefined) {
    const kit = prod.kits.find((k) => k.lbs);
    if (!kit) return [];
    const qty = Math.ceil(lbsNeeded / kit.lbs);
    return [{ ...kit, qty, totalNeeded: `${lbsNeeded.toFixed(1)} lbs`, unitLabel: "lbs" }];
  }
  if (galsNeeded === 0) {
    const raw = qtyNeeded !== undefined ? Number(qtyNeeded) : 1;
    const need = Number.isFinite(raw) && raw > 0 ? raw : 1;
    const purchaseKits = Math.max(1, Math.ceil(need));
    return [
      {
        ...prod.kits[0],
        qty: purchaseKits,
        totalNeeded: `${need.toFixed(2)} kit job calc → ${purchaseKits} kit(s) to order (whole kits only)`,
        unitLabel: "kit",
      },
    ];
  }
  const buffered = galsNeeded * 1.1;
  const required = galsNeeded;
  const result = [];
  let remaining = buffered;
  const galKits = prod.kits.filter((k) => k.gals && k.gals > 0).sort((a, b) => b.gals - a.gals);
  if (!galKits.length) return [];
  const smallestKit = galKits[galKits.length - 1];

  galKits.slice(0, -1).forEach((kit) => {
    if (remaining >= kit.gals) {
      const qty = Math.floor(remaining / kit.gals);
      if (qty > 0) {
        remaining -= qty * kit.gals;
        result.push({ ...kit, qty, totalNeeded: `${required.toFixed(2)} gal`, unitLabel: "gal" });
      }
    }
  });

  if (remaining > 0 || result.length === 0) {
    const smallestQty = Math.ceil(remaining / (smallestKit.gals || 1));
    result.push({
      ...smallestKit,
      qty: smallestQty > 0 ? smallestQty : 1,
      totalNeeded: `${required.toFixed(2)} gal`,
      unitLabel: "gal",
    });
  }
  return result;
}

export function buildOrderList(layers, tier, answers = {}) {
  const lines = [];
  layers.forEach((layer) => {
    const pk = resolveLayerProductKey(layer, answers);
    const prod = PRODUCTS[pk];
    if (!prod) return;
    const kits = calcKits(pk, layer.gals !== undefined ? layer.gals : 0, layer.lbs, layer.qty);
    kits.forEach((kit) => {
      const tierPrice = getKitTierPrice(kit, pk, tier);
      let productLabel = prod.name;
      if (pk === "epoly_pigment_nonstock" && answers?.baseCoatColor) {
        productLabel = `E-Poly Pigment — ${answers.baseCoatColor} (off stocking list — verify MSRP; temp @ Black list)`;
      }
      lines.push({
        product: productLabel,
        layer: layer.label,
        notes: layer.notes || "",
        kitSize: kit.size,
        qty: kit.qty,
        totalNeeded:
          layer.key === "epoly_pigment" && layer.gals !== undefined
            ? `${(layer.gals * 128).toFixed(2)} oz`
            : kit.totalNeeded,
        msrpEa: kit.msrp,
        tierEa: tierPrice,
        lineMsrp: +(kit.msrp * kit.qty).toFixed(2),
        lineTier: +(tierPrice * kit.qty).toFixed(2),
      });
    });
  });
  return lines;
}

// ─── RECOMMENDATION HELPERS ──────────────────────────────────────────────────

export function getFullLocationSystemKeys(location) {
  if (location === "exterior") return ["FLK-OD-RES"];
  if (location === "interior") {
    return [
      "FLK-ID-RES",
      "FLK-ID-COM",
      "METALLIC-ID",
      "QUARTZ-ID-COM",
      "SC-ID-EZ-CLEAN",
      "SC-ID-TEX",
      "GRIND-SEAL",
    ];
  }
  return [];
}

export function getRecommendedSystem(answers) {
  const { location, finish, use } = answers || {};
  if (!location || !finish) return null;

  if (location === "exterior") return "FLK-OD-RES";

  if (finish === "flake") {
    if (use === "commercial") return "FLK-ID-COM";
    return "FLK-ID-RES";
  }
  if (finish === "solid") return "SC-ID-EZ-CLEAN";
  if (finish === "metallic") return "METALLIC-ID";
  if (finish === "quartz") return "QUARTZ-ID-COM";
  if (finish === "solid_tex") return "SC-ID-TEX";
  if (finish === "grind_seal") return "GRIND-SEAL";
  return null;
}

export function getRecommendedBaseCoatLabels(colorValue) {
  const selected = STOCKED_COLORS.find((c) => c.value === colorValue);
  if (!selected?.recommendedBase) return [];
  return selected.recommendedBase
    .split(" or ")
    .map((s) => s.trim())
    .filter((label) => BASE_COAT_COLOR_OPTIONS.some((opt) => opt.value === label));
}

export function getAutoBaseCoatFromFlakeColor(colorValue) {
  const selected = STOCKED_COLORS.find((c) => c.value === colorValue);
  if (!selected?.recommendedBase) return null;
  const preferred = String(selected.recommendedBase).split(" or ")[0].trim();
  const match = BASE_COAT_COLOR_OPTIONS.find((opt) => opt.value === preferred);
  return match ? match.value : preferred;
}

export function getRecommendationReason(answers, systemKey) {
  if (!systemKey) {
    if (answers?.location === "exterior") {
      if (answers.moisture === "high") {
        return "Outdoor flake with high moisture: MV2112 MVB is included ahead of the polyurea base.";
      }
      if (answers.moisture === "moderate") {
        return "Outdoor flake with moderate moisture: HyperPrime MVB is included ahead of the polyurea base.";
      }
      return "Outdoor install prioritizes UV stability and fast cure chemistry.";
    }
    return "";
  }
  if (answers.location === "exterior") {
    if (answers.moisture === "high") {
      return "Outdoor flake with high moisture: MV2112 MVB is included ahead of the polyurea base (100 ft²/gal, lower end of range).";
    }
    if (answers.moisture === "moderate") {
      return "Outdoor flake with moderate moisture: HyperPrime MVB is included ahead of the polyurea base (100 ft²/gal, lower end) — may be pigmented; need not be applied neat.";
    }
    return "Outdoor install prioritizes UV stability and fast cure chemistry.";
  }
  if (answers.finish === "flake" && answers.moisture === "high" && answers.use === "commercial") {
    return "Commercial flake with high moisture: MV2112 MVB add-on on FLK-ID-COM.";
  }
  if (answers.finish === "flake" && answers.moisture === "moderate" && answers.use === "commercial") {
    return "Commercial flake with moderate moisture: HyperPrime MVB add-on on FLK-ID-COM.";
  }
  if (answers.finish === "flake" && answers.use === "commercial") {
    return "Commercial use needs heavier wear package (E-Z Top 85 traffic coat).";
  }
  if (answers.finish === "solid" && answers.moisture === "high") {
    return "High moisture adds MV2112 MVB to the solid-color build.";
  }
  if (answers.finish === "solid" && answers.moisture === "moderate") {
    return "Moderate moisture adds HyperPrime MVB to the solid-color build.";
  }
  if (answers.finish === "metallic") return "Metallic finish prioritizes artistic flow and clarity.";
  if (answers.finish === "quartz" && answers.moisture === "high") {
    return "Quartz broadcast coat 1 uses MV2112 when moisture risk is high.";
  }
  if (answers.finish === "quartz" && answers.moisture === "moderate") {
    return "Quartz broadcast coat 1 uses HyperPrime MVB when moisture risk is moderate.";
  }
  if (answers.finish === "quartz") {
    return "Quartz finish uses pigmented HyperBond for broadcast coat 1 when moisture risk is low.";
  }
  return "Best fit based on your current location, finish, and refine answers.";
}

export function money(n) {
  return Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// ─── JOB RESULTS + VISUAL STACK ──────────────────────────────────────────────

export function buildJobResults({ systemKey, sqFt, answers = {}, speed, tierKey = "msrp" }) {
  const system = SYSTEMS[systemKey];
  if (!system) return null;

  const sf = parseFloat(sqFt) || 0;
  const moisture = answers.moisture || "none";
  const baseProduct = answers.baseProduct || suggestBaseProductForMoisture(moisture);
  const topcoatProduct =
    answers.topcoatProduct ||
    (systemKey === "FLK-OD-RES" ? "aspartic85" : "dt454_clear");
  const opts = {
    moisture,
    hasCracks: answers.cracks === "yes",
    odorConcern: answers.odorConcern === "yes",
    steps: 0,
    speed: baseProduct === "polyurea" ? speed || "slow" : "slow",
    baseProduct,
    topcoatProduct,
    metallicPrimerTint: answers.metallicPrimerTint || "Gray",
  };

  const layers = system.layers(sf, opts);
  const orderLines = buildOrderList(layers, tierKey, answers);
  const totalMsrp = orderLines.reduce((sum, line) => sum + line.lineMsrp, 0);
  const totalTier = orderLines.reduce((sum, line) => sum + line.lineTier, 0);
  const totalDiscount = totalMsrp - totalTier;
  const costPerSqFt = sf > 0 ? +(totalTier / sf).toFixed(2) : 0;

  return {
    system,
    layers,
    orderLines,
    totals: {
      sf,
      totalMsrp,
      totalTier,
      totalDiscount,
    },
    costPerSqFt,
  };
}

/** Thin wrapper for outdoor free path callers (FreeCalculator). */
export function buildFreeOutdoorResults({ sqFt, answers, speed, tierKey = "msrp" }) {
  const result = buildJobResults({
    systemKey: FREE_SYSTEM_KEY,
    sqFt,
    answers,
    speed,
    tierKey,
  });
  if (!result) return null;
  return {
    system: result.system,
    sf: result.totals.sf,
    layers: result.layers,
    orderLines: result.orderLines,
    totalMsrp: result.totals.totalMsrp,
    totalTier: result.totals.totalTier,
    totalDiscount: result.totals.totalDiscount,
    costPerSqFt: result.costPerSqFt,
  };
}

function layerHay(line) {
  return String(line?.layer || "").toLowerCase();
}

function pickOrderLine(orderLines, predicates, { preferLast = false } = {}) {
  const matches = orderLines.filter((line) => {
    const hay = layerHay(line);
    return predicates.some((p) => hay.includes(p));
  });
  if (!matches.length) return null;
  return preferLast ? matches[matches.length - 1] : matches[0];
}

function stackCard(role, line, { title, hex, swatchLabel } = {}) {
  return {
    role,
    title: title || line?.layer || role,
    product: line?.product || "",
    layer: line?.layer || "",
    kitSize: line?.kitSize || "",
    qty: line?.qty ?? 0,
    totalNeeded: line?.totalNeeded || "",
    notes: line?.notes || "",
    hex: hex || null,
    swatchLabel: swatchLabel || null,
    line: line || null,
  };
}

/**
 * Three pitch-phone display layers (top → base) derived from real order lines.
 * Base prefers moisture/MVB lines when present.
 */
export function buildVisualStack(orderLines, answers = {}) {
  const lines = Array.isArray(orderLines) ? orderLines : [];
  const flakeMeta = STOCKED_COLORS.find((c) => c.value === answers.color);
  const baseMeta = BASE_COAT_COLOR_OPTIONS.find((c) => c.value === answers.baseCoatColor);

  const topcoat = pickOrderLine(
    lines,
    ["final clear topcoat", "traffic topcoat", "clear topcoat", "final topcoat", "topcoat", "grout coat"],
    { preferLast: true }
  );

  const flake = pickOrderLine(lines, [
    "decorative flake",
    "flake",
    "colored quartz aggregate",
    "quartz aggregate",
    "metallic pigment",
    "artistic layer",
    "silica sand",
  ]);

  const moistureBase = pickOrderLine(lines, [
    "mvb add-on",
    "mvb —",
    "broadcast coat 1",
    "primer / bond",
    "primer —",
  ]);
  const structuralBase = pickOrderLine(lines, [
    "basecoat",
    "base coat",
    "body coat",
    "prime/base",
    "broadcast coat",
  ]);
  const base = moistureBase || structuralBase;

  return [
    stackCard("topcoat", topcoat, {
      title: "Clear topcoat",
      hex: "#e8eef7",
      swatchLabel: "Clear",
    }),
    stackCard("flake", flake, {
      title: flakeMeta?.value ? `Flake — ${flakeMeta.value}` : "Broadcast",
      hex: flakeMeta?.hex || "#7F8790",
      swatchLabel: flakeMeta?.value || answers.color || null,
    }),
    stackCard("base", base, {
      title: moistureBase
        ? moistureBase.layer
        : baseMeta?.value
          ? `Base — ${baseMeta.value}`
          : "Base / primer",
      hex: moistureBase ? "#5b7c99" : baseMeta?.hex || "#c9cacc",
      swatchLabel: moistureBase
        ? moistureBase.layer
        : baseMeta?.value || answers.baseCoatColor || null,
    }),
  ];
}
