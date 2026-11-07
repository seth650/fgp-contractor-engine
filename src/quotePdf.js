import { jsPDF } from "jspdf";
import { buildExtraBlocks } from "./quoteExtras.js";

const RIDGE = [196, 141, 87];
const INK = [17, 17, 17];
const MUTED = [92, 107, 125];
const LINE = [235, 228, 218];
const CREAM = [247, 242, 235];
const CREAM_2 = [250, 247, 242];
const RED = [226, 59, 50];
const PAGE = [255, 255, 255];
const GREYED = [210, 204, 196];

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hexToRgb(hex) {
  const h = String(hex || "#888888").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

async function loadImageDataUrl(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fillTriangle(doc, x1, y1, x2, y2, x3, y3) {
  doc.lines(
    [
      [x2 - x1, y2 - y1],
      [x3 - x2, y3 - y2],
      [x1 - x3, y1 - y3],
    ],
    x1,
    y1,
    [1, 1],
    "F",
    true
  );
}

function drawRidgelineMark(doc, x, y) {
  // Mountain mark (matches ridgeline-mark.svg)
  doc.setFillColor(...RIDGE);
  fillTriangle(doc, x, y + 22, x + 12, y + 2, x + 20, y + 14);
  fillTriangle(doc, x + 14, y + 22, x + 24, y + 6, x + 32, y + 16);
  doc.setFillColor(196, 141, 87);
  doc.setGState(new doc.GState({ opacity: 0.55 }));
  fillTriangle(doc, x + 8, y + 22, x + 18, y + 8, x + 26, y + 18);
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("RIDGELINE", x + 40, y + 12);

  doc.setDrawColor(...RIDGE);
  doc.setLineWidth(1.1);
  doc.line(x + 40, y + 17, x + 54, y + 17);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text("COATINGS", x + 58, y + 20);

  doc.line(x + 118, y + 17, x + 132, y + 17);
}

function pillCheck(doc, text, x, y) {
  doc.setTextColor(...RIDGE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("✓", x, y);
  doc.setTextColor(244, 240, 234);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(text.toUpperCase(), x + 10, y);
}

/** Build a customer-facing quote PDF matching the on-screen Ridgeline quote. */
export async function buildQuotePdfBlobUrl({
  customerName,
  jobName,
  dateLabel,
  sellPrice,
  sf,
  color,
  baseCoatColor,
  flakeHex,
  baseHex,
  deposit,
  depositLabel,
  balanceDue,
  scope,
}) {
  const badgeDataUrl = await loadImageDataUrl("/brand/fgp-certified-badge.png");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;

  // Page backdrop
  doc.setFillColor(...PAGE);
  doc.rect(0, 0, pageW, pageH, "F");

  // Top trust bar
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, 32, "F");
  pillCheck(doc, "Showroom quality floors", margin, 20);
  pillCheck(doc, "Limited lifetime warranty", margin + 168, 20);
  pillCheck(doc, "Locally owned since 2016", margin + 360, 20);

  // Brand bar
  let y = 52;
  drawRidgelineMark(doc, margin, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text("Lexington, KY", pageW - margin, y + 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("(859) 555-0148", pageW - margin, y + 24, { align: "right" });

  y = 92;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(margin, y, pageW - margin, y);

  // Quote head
  y = 118;
  doc.setTextColor(...RED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("QUOTE FOR", margin, y);

  y += 26;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(customerName || "Customer", margin, y);

  doc.setFontSize(28);
  doc.text(money(sellPrice), pageW - margin, y, { align: "right" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`${jobName || "Job"}  ·  ${dateLabel}`, margin, y);

  y += 18;
  doc.setDrawColor(...LINE);
  doc.line(margin, y, pageW - margin, y);

  // Finish strip with swatches
  y += 18;
  const stripH = 64;
  doc.setFillColor(...CREAM);
  doc.setDrawColor(...LINE);
  doc.roundedRect(margin, y, contentW, stripH, 10, 10, "FD");

  const flakeRgb = hexToRgb(flakeHex);
  const baseRgb = hexToRgb(baseHex);
  const sw = 36;
  const swY = y + (stripH - sw) / 2;
  doc.setFillColor(...flakeRgb);
  doc.setDrawColor(210, 200, 188);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin + 14, swY, sw, sw, 8, 8, "FD");

  doc.setFillColor(...baseRgb);
  doc.roundedRect(margin + 14 + sw + 8, swY, sw, sw, 8, 8, "FD");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(2.5);
  doc.roundedRect(margin + 14 + sw + 8 + 6, swY + 6, sw - 12, sw - 12, 5, 5, "S");

  const textX = margin + 14 + sw * 2 + 24;
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`${color} on ${baseCoatColor}`, textX, y + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Decorative flake floor  ·  ${sf} ft²`, textX, y + 44);

  // Pricing grid — 2x2 like the web quote
  y += stripH + 28;
  const colW = contentW / 2;
  const cells = [
    ["PROJECT TOTAL", money(sellPrice)],
    ["PER FT²", money(sellPrice / (sf || 1))],
    [`DEPOSIT DUE (${String(depositLabel).toUpperCase()})`, money(deposit)],
    ["DUE AT COMPLETION", money(balanceDue)],
  ];
  cells.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const yy = y + row * 48;
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, x, yy);
    doc.setTextColor(...INK);
    doc.setFontSize(16);
    doc.text(value, x, yy + 20);
  });

  // Work included
  y += 110;
  const scopeLines = doc.splitTextToSize(scope || "—", contentW - 28);
  const scopeH = Math.max(64, 36 + scopeLines.length * 14);
  doc.setFillColor(...CREAM_2);
  doc.setDrawColor(...LINE);
  doc.roundedRect(margin, y, contentW, scopeH, 10, 10, "FD");
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WORK INCLUDED", margin + 14, y + 20);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(scopeLines, margin + 14, y + 40);

  // FGP certified badge — bottom of quote
  const badgeSize = 64;
  const badgeY = pageH - margin - badgeSize - 8;
  doc.addImage(badgeDataUrl, "PNG", margin, badgeY, badgeSize, badgeSize);
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Floorguard Certified Installer", margin + badgeSize + 14, badgeY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("Trained on FGP systems", margin + badgeSize + 14, badgeY + 44);

  // Soft footer rule above badge
  doc.setDrawColor(...LINE);
  doc.setLineWidth(1);
  doc.line(margin, badgeY - 16, pageW - margin, badgeY - 16);

  // Extra packet pages — structure only; proprietary wording greyed / illegible
  const extras = buildExtraBlocks({
    customerName,
    jobName,
    dateLabel,
    deposit: money(deposit),
    sf,
    color,
    baseCoatColor,
    scope,
  });

  extras.forEach((section) => {
    doc.addPage();
    doc.setFillColor(...PAGE);
    doc.rect(0, 0, pageW, pageH, "F");

    doc.setFillColor(...INK);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(...RIDGE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("✓", margin, 18);
    doc.setTextColor(244, 240, 234);
    doc.text("RIDGELINE COATINGS  ·  CUSTOMER PACKET", margin + 12, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Proprietary language redacted in FGP preview", pageW - margin, 18, { align: "right" });

    let ey = 56;
    doc.setTextColor(...RIDGE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(section.kicker || "").toUpperCase(), margin, ey);

    ey += 18;
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(section.title, margin, ey);

    ey += 14;
    doc.setDrawColor(...LINE);
    doc.line(margin, ey, pageW - margin, ey);
    ey += 18;

    // Readable blanks only
    if (section.filled.length) {
      doc.setFillColor(...CREAM);
      doc.setDrawColor(...LINE);
      const blankH = 16 + section.filled.length * 16;
      doc.roundedRect(margin, ey, contentW, blankH, 8, 8, "FD");
      section.filled.forEach((blank, i) => {
        const by = ey + 14 + i * 16;
        doc.setTextColor(...MUTED);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(`${blank.label}:`, margin + 12, by);
        doc.setTextColor(...INK);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(String(blank.value), margin + 88, by);
      });
      ey += blankH + 16;
    }

    // Greyed body — shape of legal copy, not legible IP
    doc.setTextColor(...GREYED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    section.lines.forEach((line) => {
      doc.text(line, margin, ey);
      ey += 13;
    });
    ey += 8;

    section.numbered.forEach((item) => {
      if (ey > pageH - 56) return;
      doc.setTextColor(...GREYED);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`${item.n}.`, margin, ey);
      doc.setFont("helvetica", "normal");
      const wrapped = doc.splitTextToSize(item.text, contentW - 18);
      doc.text(wrapped, margin + 16, ey);
      ey += wrapped.length * 11 + 8;
    });

  });

  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
