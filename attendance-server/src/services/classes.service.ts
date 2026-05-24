import { query, queryOne } from "../db.ts";
import { signQrToken } from "../utils/qr-token.ts";

interface ClassRow {
  id: string;
  lecturer_id: string;
  class_code: string;
  subject_name: string;
  venue: string | null;
  scheduled_at: string;
  challenge_required: boolean;
  qr_token: string;
  created_at: string;
}

export async function createClass(
  lecturerId: string,
  classCode: string,
  subjectName: string,
  venue: string | null,
  scheduledAt: string,
  challengeCode?: string
): Promise<ClassRow> {
  const challengeRequired = !!challengeCode;
  const qrToken = await signQrToken(
    crypto.randomUUID(),
    challengeRequired
  );

  // We need the UUID before signing so let's generate it first
  const id = crypto.randomUUID();
  const finalQrToken = await signQrToken(id, challengeRequired);

  const [row] = await query<ClassRow>(
    `INSERT INTO classes
       (id, lecturer_id, class_code, subject_name, venue, scheduled_at, challenge_code, challenge_required, qr_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, lecturer_id, class_code, subject_name, venue, scheduled_at, challenge_required, qr_token, created_at`,
    [
      id,
      lecturerId,
      classCode,
      subjectName,
      venue ?? null,
      scheduledAt,
      challengeCode ?? null,
      challengeRequired,
      finalQrToken,
    ]
  );
  return row;
}

export async function listClasses(lecturerId: string): Promise<ClassRow[]> {
  return query<ClassRow>(
    `SELECT id, lecturer_id, class_code, subject_name, venue, scheduled_at,
            challenge_required, qr_token, created_at
     FROM classes WHERE lecturer_id = $1 ORDER BY scheduled_at DESC`,
    [lecturerId]
  );
}

export async function getClass(
  classId: string,
  lecturerId: string
): Promise<ClassRow | null> {
  return queryOne<ClassRow>(
    `SELECT id, lecturer_id, class_code, subject_name, venue, scheduled_at,
            challenge_required, qr_token, created_at
     FROM classes WHERE id = $1 AND lecturer_id = $2`,
    [classId, lecturerId]
  );
}

export async function updateClass(
  classId: string,
  lecturerId: string,
  fields: {
    class_code?: string;
    subject_name?: string;
    venue?: string;
    scheduled_at?: string;
    challenge_code?: string | null;
  }
): Promise<ClassRow | null> {
  const sets: string[] = [];
  const args: unknown[] = [];
  let idx = 1;

  if (fields.class_code !== undefined) { sets.push(`class_code = $${idx++}`); args.push(fields.class_code); }
  if (fields.subject_name !== undefined) { sets.push(`subject_name = $${idx++}`); args.push(fields.subject_name); }
  if (fields.venue !== undefined) { sets.push(`venue = $${idx++}`); args.push(fields.venue); }
  if (fields.scheduled_at !== undefined) { sets.push(`scheduled_at = $${idx++}`); args.push(fields.scheduled_at); }
  if ("challenge_code" in fields) {
    sets.push(`challenge_code = $${idx++}`);
    sets.push(`challenge_required = $${idx++}`);
    args.push(fields.challenge_code ?? null);
    args.push(!!fields.challenge_code);
  }

  if (sets.length === 0) return getClass(classId, lecturerId);

  args.push(classId, lecturerId);
  const [row] = await query<ClassRow>(
    `UPDATE classes SET ${sets.join(", ")} WHERE id = $${idx++} AND lecturer_id = $${idx++}
     RETURNING id, lecturer_id, class_code, subject_name, venue, scheduled_at,
               challenge_required, qr_token, created_at`,
    args
  );
  return row ?? null;
}

export async function deleteClass(classId: string, lecturerId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM classes WHERE id = $1 AND lecturer_id = $2 RETURNING id",
    [classId, lecturerId]
  );
  return rows.length > 0;
}

export async function getAttendanceForClass(classId: string, lecturerId: string, flaggedOnly = false) {
  // Verify ownership
  const cls = await getClass(classId, lecturerId);
  if (!cls) return null;

  const flagFilter = flaggedOnly ? "AND ar.flagged = TRUE" : "";

  const records = await query<{
    student_id: string;
    full_name: string;
    student_number: string;
    captured_at: string;
    latitude: string;
    longitude: string;
    device_model: string;
    os: string;
    flagged: boolean;
    flag_reason: string | null;
  }>(
    `SELECT ar.student_id, u.full_name, u.student_number,
            ar.captured_at, ar.latitude, ar.longitude,
            ar.device_model, ar.os, ar.flagged, ar.flag_reason
     FROM attendance_records ar
     JOIN users u ON u.id = ar.student_id
     WHERE ar.class_id = $1 ${flagFilter}
     ORDER BY ar.captured_at ASC`,
    [classId]
  );

  const flaggedCount = records.filter((r) => r.flagged).length;

  return {
    class_id: cls.id,
    class_code: cls.class_code,
    subject_name: cls.subject_name,
    scheduled_at: cls.scheduled_at,
    total_attended: records.length,
    flagged_count: flaggedCount,
    records,
  };
}
