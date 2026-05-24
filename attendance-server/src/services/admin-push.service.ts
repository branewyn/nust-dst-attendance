import { query, queryOne } from "../db.ts";
import { config } from "../config.ts";

export async function pushToAdmin(classId: string, lecturerId: string) {
  if (!config.adminStoreUrl) {
    throw { status: 503, message: "Admin store URL is not configured" };
  }

  const cls = await queryOne<{
    class_code: string;
    subject_name: string;
    scheduled_at: string;
    lecturer_name: string;
    staff_number: string;
  }>(
    `SELECT c.class_code, c.subject_name, c.scheduled_at,
            u.full_name AS lecturer_name, u.staff_number
     FROM classes c JOIN users u ON u.id = c.lecturer_id
     WHERE c.id = $1 AND c.lecturer_id = $2`,
    [classId, lecturerId]
  );
  if (!cls) throw { status: 404, message: "Class not found" };

  const records = await query<{ student_number: string; full_name: string; captured_at: string }>(
    `SELECT u.student_number, u.full_name, ar.captured_at
     FROM attendance_records ar JOIN users u ON u.id = ar.student_id
     WHERE ar.class_id = $1 ORDER BY ar.captured_at ASC`,
    [classId]
  );

  const payload = {
    class_code: cls.class_code,
    subject_name: cls.subject_name,
    lecturer: { staff_number: cls.staff_number, full_name: cls.lecturer_name },
    scheduled_at: cls.scheduled_at,
    records: records.map((r) => ({
      student_number: r.student_number,
      full_name: r.full_name,
      captured_at: r.captured_at,
    })),
  };

  let status = "FAILED";
  let httpStatus: number | null = null;
  let responseBody: string | null = null;

  try {
    const res = await fetch(config.adminStoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.adminStoreApiKey}`,
      },
      body: JSON.stringify(payload),
    });
    httpStatus = res.status;
    responseBody = await res.text();
    status = res.ok ? "SUCCESS" : "FAILED";
  } catch (err) {
    responseBody = err instanceof Error ? err.message : "Network error";
  }

  await query(
    `INSERT INTO admin_push_logs (class_id, status, http_status, response_body)
     VALUES ($1, $2, $3, $4)`,
    [classId, status, httpStatus, responseBody]
  );

  return { status, http_status: httpStatus, pushed_at: new Date().toISOString() };
}
