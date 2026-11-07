import { jsPDF } from "jspdf";

function money(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Build a customer-facing quote PDF and return a blob URL for iframe preview. */
export function buildQuotePdfBlobUrl({
  customerName,
  jobName,
  dateLabel,
  sellPrice,
  sf,
  color,
  baseCoatColor,
  deposit,
  depositLabel,
  balanceDue,
  scope,
}) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 48;

  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, pageW, 28, "F");
  doc.setTextColor(244, 240, 234);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("SHOWROOM QUALITY FLOORS  ·  LIMITED LIFETIME WARRANTY  ·  LOCALLY OWNED SINCE 2016", margin, 18);

  y = 64;
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Ridgeline Coatings", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(92, 107, 125);
  doc.text("Lexington, KY  ·  (859) 555-0148", pageW - margin, y, { align: "right" });

  y += 28;
  doc.setDrawColor(230, 221, 210);
  doc.line(margin, y, pageW - margin, y);
  y += 28;

  doc.setTextColor(226, 59, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("QUOTE FOR", margin, y);

  y += 22;
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(customerName || "Customer", margin, y);

  doc.setFontSize(26);
  doc.text(money(sellPrice), pageW - margin, y, { align: "right" });

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(92, 107, 125);
  doc.text(`${jobName || "Job"}  ·  ${dateLabel}`, margin, y);

  y += 28;
  doc.setFillColor(247, 242, 235);
  doc.roundedRect(margin, y, pageW - margin * 2, 56, 8, 8, "F");
  doc.setTextColor(14, 28, 58);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`${color} on ${baseCoatColor}`, margin + 16, y + 24);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(92, 107, 125);
  doc.setFontSize(10);
  doc.text(`Decorative flake floor  ·  ${sf} ft²`, margin + 16, y + 42);

  y += 80;
  const colW = (pageW - margin * 2) / 2;
  const rows = [
    ["PROJECT TOTAL", money(sellPrice)],
    ["PER FT²", money(sellPrice / (sf || 1))],
    [`DEPOSIT DUE (${depositLabel})`, money(deposit)],
    ["DUE AT COMPLETION", money(balanceDue)],
  ];
  rows.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const yy = y + row * 44;
    doc.setTextColor(92, 107, 125);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(label, x, yy);
    doc.setTextColor(17, 17, 17);
    doc.setFontSize(14);
    doc.text(value, x, yy + 18);
  });

  y += 100;
  doc.setFillColor(250, 247, 242);
  doc.roundedRect(margin, y, pageW - margin * 2, 72, 8, 8, "F");
  doc.setTextColor(92, 107, 125);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("WORK INCLUDED", margin + 16, y + 20);
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const scopeLines = doc.splitTextToSize(scope || "—", pageW - margin * 2 - 32);
  doc.text(scopeLines, margin + 16, y + 40);

  y += 100;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(14, 28, 58);
  doc.text("Floorguard Certified Installer", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(92, 107, 125);
  doc.setFontSize(9);
  doc.text("Trained on FGP systems", margin, y + 14);

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Customer PDF preview — matches the quote you send.", margin, 752);

  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
