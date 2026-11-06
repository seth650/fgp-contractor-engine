/** Sample data only. Matches the pitch screens. Not live store or customer records. */

export const JOB = {
  customer: "Mike Russell",
  system: "FGP Flake System",
  place: "Russell garage",
  sqft: 400,
  price: 5500,
  materials: 1660.44,
  crew: 640,
  consumables: 55.64,
  travel: 103.8,
  resinOrder: 1120.8,
};

export const KITS = [
  { name: "Polyurea basecoat", detail: "2 gal kit", qty: "1 kit" },
  { name: "Decorative flake", detail: "Broadcast to rejection", qty: "40 lb" },
  { name: "Aspartic topcoat", detail: "Slow, low odor", qty: "1 kit" },
];

export const COLORS = ["Domino", "Gravel", "Nightfall", "Shoreline", "Creekbed", "Tidal"];

export const STORE_ORDERS = [
  { id: "FG-1042", contractor: "Mike Russell", job: "Russell garage", system: "FGP Flake", total: 1120.8, status: "Ready to pick", when: "Today 2:40 PM" },
  { id: "FG-1038", contractor: "Dana Cole", job: "Cole basement", system: "FGP Solid", total: 864.2, status: "Approved quote", when: "Today 11:15 AM" },
  { id: "FG-1031", contractor: "Luis Ortega", job: "Ortega showroom", system: "FGP Metallic", total: 2140, status: "Invoiced", when: "Yesterday" },
  { id: "FG-1026", contractor: "Amy Chen", job: "Chen patio", system: "FGP Flake", total: 990.5, status: "Pickup 4 PM", when: "Yesterday" },
];

export const PICK = [
  { item: "Polyurea basecoat kit", bin: "A-12", qty: "1" },
  { item: "Flake blend — Domino", bin: "C-04", qty: "40 lb" },
  { item: "Aspartic topcoat kit", bin: "A-18", qty: "1" },
];

export const CONTRACTORS = [
  { name: "Mike Russell", tier: "Preferred", jobs: 6 },
  { name: "Dana Cole", tier: "Contractor", jobs: 3 },
  { name: "Luis Ortega", tier: "Small buyer", jobs: 2 },
  { name: "Amy Chen", tier: "MSRP", jobs: 1 },
];

export const NETWORK = [
  { label: "Member contractors", value: "160", note: "last 30 days" },
  { label: "Orders through the engine", value: "$110,360", note: "sample" },
  { label: "Resin in those orders", value: "$48,000", note: "sample" },
  { label: "Quotes on FGP systems", value: "94%", note: "sample" },
];

export const LOCATIONS = [
  { name: "Floorgard Midwest", amount: 18420 },
  { name: "Floorgard Pittsburgh", amount: 14210 },
  { name: "Floorgard Chicago", amount: 12180 },
  { name: "Floorgard Ohio", amount: 9860 },
  { name: "Floorgard Indiana", amount: 7420 },
];

export const PRODUCTS = [
  { name: "FGP Flake System", share: "38%" },
  { name: "FGP Solid Color", share: "24%" },
  { name: "FGP Metallic", share: "16%" },
  { name: "FGP Quartz", share: "12%" },
  { name: "Grind & seal", share: "10%" },
];

export function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function jobCost() {
  return JOB.materials + JOB.crew + JOB.consumables + JOB.travel;
}

export function margin() {
  const cost = jobCost();
  return { dollars: JOB.price - cost, pct: ((JOB.price - cost) / JOB.price) * 100 };
}
