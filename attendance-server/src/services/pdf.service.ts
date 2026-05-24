import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from "pdf-lib";
import { query, queryOne } from "../db.ts";

interface ClassInfo {
  class_code: string;
  subject_name: string;
  venue: string | null;
  scheduled_at: string;
  lecturer_name: string;
}

interface AttendanceRecord {
  student_number: string;
  full_name: string;
  captured_at: string;
  device_model: string;
  os: string;
  flagged: boolean;
}

export async function generateAttendancePdf(
  classId: string,
  lecturerId: string
): Promise<Uint8Array | null> {
  const cls = await queryOne<ClassInfo>(
    `SELECT c.class_code, c.subject_name, c.venue, c.scheduled_at,
            u.full_name AS lecturer_name
     FROM classes c JOIN users u ON u.id = c.lecturer_id
     WHERE c.id = $1 AND c.lecturer_id = $2`,
    [classId, lecturerId]
  );
  if (!cls) return null;

  const records = await query<AttendanceRecord>(
    `SELECT u.student_number, u.full_name, ar.captured_at,
            ar.device_model, ar.os, ar.flagged
     FROM attendance_records ar JOIN users u ON u.id = ar.student_id
     WHERE ar.class_id = $1 ORDER BY ar.captured_at ASC`,
    [classId]
  );

  const pdf = await PDFDocument.create();
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);

  const PAGE_W = 595;
  const PAGE_H = 842;
  const MARGIN = 50;
  const COL_W = [100, 170, 130, 100, 50];
  const ROW_H = 20;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const drawText = (
    p: PDFPage,
    text: string,
    x: number,
    yPos: number,
    font: PDFFont,
    size: number,
    color = rgb(0, 0, 0)
  ) => p.drawText(text, { x, y: yPos, size, font, color });

  // Header
  drawText(page, "ATTENDANCE REPORT", MARGIN, y, boldFont, 16);
  y -= 25;
  drawText(page, `Subject: ${cls.subject_name} (${cls.class_code})`, MARGIN, y, regularFont, 11);
  y -= 16;
  drawText(page, `Lecturer: ${cls.lecturer_name}`, MARGIN, y, regularFont, 11);
  y -= 16;
  drawText(page, `Venue: ${cls.venue ?? "N/A"}`, MARGIN, y, regularFont, 11);
  y -= 16;
  drawText(page, `Scheduled: ${new Date(cls.scheduled_at).toLocaleString()}`, MARGIN, y, regularFont, 11);
  y -= 16;
  drawText(page, `Total Attended: ${records.length}`, MARGIN, y, regularFont, 11);
  y -= 16;
  drawText(
    page,
    `Flagged Records: ${records.filter((r) => r.flagged).length}`,
    MARGIN,
    y,
    regularFont,
    11,
    records.some((r) => r.flagged) ? rgb(0.8, 0.2, 0.2) : rgb(0, 0, 0)
  );
  y -= 30;

  // Table header
  const headers = ["Student No.", "Full Name", "Captured At", "Device", "⚠"];
  let x = MARGIN;
  headers.forEach((h, i) => {
    page.drawRectangle({ x, y: y - 5, width: COL_W[i], height: ROW_H, color: rgb(0.2, 0.4, 0.7) });
    drawText(page, h, x + 4, y, boldFont, 9, rgb(1, 1, 1));
    x += COL_W[i];
  });
  y -= ROW_H + 2;

  // Table rows
  let rowIndex = 0;
  for (const rec of records) {
    if (y < MARGIN + ROW_H + 10) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }

    const bg = rec.flagged
      ? rgb(1, 0.94, 0.94)
      : rowIndex % 2 === 0 ? rgb(0.97, 0.97, 0.97) : rgb(1, 1, 1);

    x = MARGIN;
    COL_W.forEach((w) => {
      page.drawRectangle({ x, y: y - 5, width: w, height: ROW_H, color: bg });
      x += w;
    });

    x = MARGIN;
    const capturedStr = new Date(rec.captured_at).toLocaleString();
    const deviceStr = `${rec.device_model ?? ""} (${rec.os ?? ""})`.slice(0, 18);
    const cells = [
      rec.student_number,
      rec.full_name.slice(0, 22),
      capturedStr,
      deviceStr,
      rec.flagged ? "!" : "",
    ];

    cells.forEach((cell, i) => {
      const color = rec.flagged && i === 4 ? rgb(0.8, 0.1, 0.1) : rgb(0, 0, 0);
      drawText(page, cell, x + 4, y, regularFont, 8, color);
      x += COL_W[i];
    });

    y -= ROW_H;
    rowIndex++;
  }

  // Footer
  y -= 20;
  drawText(
    page,
    `Generated: ${new Date().toLocaleString()}`,
    MARGIN,
    y,
    regularFont,
    8,
    rgb(0.5, 0.5, 0.5)
  );

  return pdf.save();
}
