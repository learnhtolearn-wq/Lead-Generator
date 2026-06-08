import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

interface Lead {
  company_name?: string | null;
  contact_name?: string | null;
  contact_title?: string | null;
  email?: string | null;
  website_url?: string | null;
  location?: string | null;
  score?: number | null;
}

interface ExportBody {
  leads: Lead[];
  niche?: string;
  geo?: string;
  runLabel?: string;
}

// ARGB hex colour constants (ExcelJS uses AARRGGBB)
const C = {
  red:        "FFD23F33",
  redDark:    "FFAA2F26",
  redLight:   "FFEF6B63",
  white:      "FFFFFFFF",
  bgEven:     "FFFFFFFF",
  bgOdd:      "FFF7F7F8",
  text:       "FF18181A",
  muted:      "FF6B7280",
  border:     "FFE4E4E7",
  borderHdr:  "FFCC3B30",
  green:      "FF16A34A",
  amber:      "FFD97706",
  scoreGray:  "FF9CA3AF",
};

function scoreColor(n: number): string {
  if (n >= 80) return C.green;
  if (n >= 65) return C.amber;
  return C.scoreGray;
}

function deriveScore(lead: Lead): number {
  const hash = (lead.website_url ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let s = 55 + (hash % 8);
  if (lead.email) s += 18;
  if (lead.contact_name) s += 10;
  if (lead.contact_title) s += 8;
  if (lead.location) s += 5;
  return Math.min(s, 99);
}

function stripDomain(url: string | null | undefined): string {
  return (url ?? "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  let body: ExportBody;
  try {
    body = await req.json() as ExportBody;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { leads = [], niche = "", geo = "", runLabel = "" } = body;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Prospela";
  wb.lastModifiedBy = "Prospela";
  wb.created = new Date();
  wb.modified = new Date();

  // ── Sheet ──────────────────────────────────────────────────────────────
  const ws = wb.addWorksheet("Leads", {
    views: [{ state: "frozen", ySplit: 1, showGridLines: false }],
    properties: { defaultRowHeight: 22 },
    pageSetup: {
      paperSize: 9,            // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
  });

  ws.headerFooter = {
    oddHeader: `&L&"Calibri,Bold"&12Prospela — Leads Export&R&"Calibri"&10${niche}  •  ${geo}`,
    oddFooter:  `&L&"Calibri"&9Exported ${new Date().toLocaleDateString()}&R&"Calibri"&9Page &P of &N`,
  };

  // ── Columns ─────────────────────────────────────────────────────────────
  ws.columns = [
    { header: "#",            key: "idx",     width: 5  },
    { header: "Company",      key: "company", width: 28 },
    { header: "Domain",       key: "domain",  width: 22 },
    { header: "Contact Name", key: "contact", width: 22 },
    { header: "Job Title",    key: "title",   width: 26 },
    { header: "Email",        key: "email",   width: 34 },
    { header: "Location",     key: "location",width: 20 },
    { header: "Fit Score",    key: "score",   width: 11 },
    { header: "Website URL",  key: "website", width: 36 },
  ];

  // ── Header row ──────────────────────────────────────────────────────────
  const hdr = ws.getRow(1);
  hdr.height = 34;
  hdr.eachCell((cell) => {
    cell.fill   = { type: "pattern", pattern: "solid", fgColor: { argb: C.red } };
    cell.font   = { name: "Calibri", bold: true, size: 11, color: { argb: C.white } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
    cell.border = {
      top:    { style: "thin",   color: { argb: C.redDark } },
      bottom: { style: "medium", color: { argb: C.redDark } },
      left:   { style: "thin",   color: { argb: C.redDark } },
      right:  { style: "thin",   color: { argb: C.redDark } },
    };
  });

  // ── Data rows ───────────────────────────────────────────────────────────
  leads.forEach((lead, i) => {
    const domain = stripDomain(lead.website_url);
    const score  = lead.score ?? deriveScore(lead);
    const bg     = i % 2 === 0 ? C.bgEven : C.bgOdd;

    const row = ws.addRow({
      idx:     i + 1,
      company: lead.company_name  ?? "—",
      domain,
      contact: lead.contact_name  ?? "—",
      title:   lead.contact_title ?? "—",
      email:   lead.email         ?? "—",
      location:lead.location      ?? "—",
      score,
      website: lead.website_url   ?? "—",
    });
    row.height = 22;

    row.eachCell({ includeEmpty: true }, (cell, col) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      cell.font      = { name: "Calibri", size: 10, color: { argb: C.text } };
      cell.alignment = { vertical: "middle", wrapText: false };
      cell.border    = { bottom: { style: "thin", color: { argb: C.border } } };

      // col 1 — row number, centered, muted
      if (col === 1) {
        cell.font      = { name: "Calibri", size: 9, color: { argb: C.muted } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
      // col 3 — domain (muted)
      if (col === 3) {
        cell.font = { name: "Calibri", size: 9.5, color: { argb: C.muted } };
      }
      // col 6 — email: hyperlink + red
      if (col === 6 && lead.email) {
        cell.value = { text: lead.email, hyperlink: `mailto:${lead.email}` };
        cell.font  = { name: "Calibri", size: 10, color: { argb: C.redLight }, underline: true };
      }
      // col 7 — location muted
      if (col === 7) {
        cell.font = { name: "Calibri", size: 10, color: { argb: C.muted } };
      }
      // col 8 — score: bold, colour-coded, centered
      if (col === 8) {
        cell.font      = { name: "Calibri", size: 11, bold: true, color: { argb: scoreColor(score) } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      }
      // col 9 — website hyperlink muted
      if (col === 9 && lead.website_url) {
        cell.value = { text: domain, hyperlink: lead.website_url };
        cell.font  = { name: "Calibri", size: 9.5, color: { argb: C.muted }, underline: true };
      }
    });
  });

  // ── Auto-filter ─────────────────────────────────────────────────────────
  ws.autoFilter = { from: "A1", to: "I1" };

  // ── Summary footer row ──────────────────────────────────────────────────
  ws.addRow([]);
  const sumRow = ws.addRow([
    `${leads.length} lead${leads.length !== 1 ? "s" : ""} exported from Prospela${runLabel ? `  ·  ${runLabel}` : ""}  ·  ${niche || ""}${geo ? `  ·  ${geo}` : ""}  ·  ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
  ]);
  ws.mergeCells(`A${sumRow.number}:I${sumRow.number}`);
  const sumCell = sumRow.getCell(1);
  sumCell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F3F4" } };
  sumCell.font      = { name: "Calibri", size: 9, italic: true, color: { argb: C.muted } };
  sumCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sumCell.border    = { top: { style: "thin", color: { argb: C.border } } };
  sumRow.height = 20;

  // ── Render ──────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();

  const filename = `prospela-${(niche || "leads").toLowerCase().replace(/\s+/g, "-")}.xlsx`;

  const uint8 = new Uint8Array(buffer as ArrayBuffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
