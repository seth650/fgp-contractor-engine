/**
 * Quote packet extras for the customer-facing preview.
 * Body copy is intentionally greyed / illegible so proprietary
 * contractor language is not exposed in the FGP shared app.
 * Live blanks (customer, job, deposit, dates) stay readable.
 */

const SEEDS = [
  "process preparation coating cure schedule deposit mobilization moisture concrete finish maintenance",
  "surface profile repairs joints lighting access samples environment warranty bond wear life",
  "change order cancellation materials labor timeline approval site conditions scope variance",
  "cleaning spills mats chairs apron plasticizer urine flatness color selection sight unseen",
];

function scrambleLine(seed, len = 92) {
  const words = seed.split(" ");
  const out = [];
  let n = 0;
  while (n < len) {
    const w = words[(n + words.length * 3) % words.length];
    // Soft glyph scrambling — readable shape, not the real clause
    const soft = w
      .split("")
      .map((ch, i) => (i % 3 === 1 ? "·" : i % 5 === 2 ? ch : ch))
      .join("");
    out.push(soft);
    n += soft.length + 1;
  }
  return out.join(" ").slice(0, len);
}

function greyParagraphs(seedIndex, count) {
  const seed = SEEDS[seedIndex % SEEDS.length];
  return Array.from({ length: count }, (_, i) => scrambleLine(seed, 88 + ((i * 7) % 18)));
}

export const QUOTE_EXTRA_SECTIONS = [
  {
    id: "process",
    title: "Our process",
    kicker: "What happens next",
    blankKeys: ["customer", "deposit", "date"],
    paras: 3,
    seed: 0,
  },
  {
    id: "terms",
    title: "Terms of service",
    kicker: "Understanding ensures there are no questions",
    blankKeys: ["customer", "job", "sf"],
    paras: 6,
    seed: 1,
    numbered: true,
    numberCount: 8,
  },
  {
    id: "warranty",
    title: "Warranty & care",
    kicker: "Limited lifetime structure · maintenance required",
    blankKeys: ["color", "system"],
    paras: 4,
    seed: 2,
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    kicker: "Site conditions & exclusions",
    blankKeys: ["scope"],
    paras: 4,
    seed: 3,
    numbered: true,
    numberCount: 6,
  },
];

export function buildExtraBlocks(blanks) {
  return QUOTE_EXTRA_SECTIONS.map((section) => {
    const filled = [];
    if (section.blankKeys.includes("customer") && blanks.customerName) {
      filled.push({ label: "Prepared for", value: blanks.customerName });
    }
    if (section.blankKeys.includes("job") && blanks.jobName) {
      filled.push({ label: "Job", value: blanks.jobName });
    }
    if (section.blankKeys.includes("sf") && blanks.sf) {
      filled.push({ label: "Area", value: `${blanks.sf} ft²` });
    }
    if (section.blankKeys.includes("deposit") && blanks.deposit != null) {
      filled.push({ label: "Deposit due", value: blanks.deposit });
    }
    if (section.blankKeys.includes("date") && blanks.dateLabel) {
      filled.push({ label: "Quote date", value: blanks.dateLabel });
    }
    if (section.blankKeys.includes("color") && blanks.color) {
      filled.push({
        label: "Finish",
        value: `${blanks.color} on ${blanks.baseCoatColor || "base"}`,
      });
    }
    if (section.blankKeys.includes("system") && blanks.system) {
      filled.push({ label: "System", value: blanks.system });
    }
    if (section.blankKeys.includes("scope") && blanks.scope) {
      filled.push({ label: "Scope", value: blanks.scope });
    }

    const lines = greyParagraphs(section.seed, section.paras);
    const numbered = section.numbered
      ? Array.from({ length: section.numberCount }, (_, i) => ({
          n: i + 1,
          text: scrambleLine(SEEDS[(section.seed + i) % SEEDS.length], 78),
        }))
      : [];

    return { ...section, filled, lines, numbered };
  });
}
