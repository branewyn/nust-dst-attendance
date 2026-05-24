import { query, queryOne } from "../db.ts";
import { hashPassword } from "../utils/hash.ts";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  student_number: string | null;
  staff_number: string | null;
  active: boolean;
  created_at: string;
}

export async function listUsers(role?: string): Promise<UserRow[]> {
  if (role) {
    return query<UserRow>(
      `SELECT id, email, full_name, role, student_number, staff_number, active, created_at
       FROM users WHERE role = $1 ORDER BY created_at DESC`,
      [role]
    );
  }
  return query<UserRow>(
    "SELECT id, email, full_name, role, student_number, staff_number, active, created_at FROM users ORDER BY created_at DESC"
  );
}

export async function getUser(userId: string): Promise<UserRow | null> {
  return queryOne<UserRow>(
    "SELECT id, email, full_name, role, student_number, staff_number, active, created_at FROM users WHERE id = $1",
    [userId]
  );
}

export async function updateUser(
  userId: string,
  fields: { full_name?: string; active?: boolean }
): Promise<UserRow | null> {
  const sets: string[] = [];
  const args: unknown[] = [];
  let idx = 1;

  if (fields.full_name !== undefined) { sets.push(`full_name = $${idx++}`); args.push(fields.full_name); }
  if (fields.active !== undefined) { sets.push(`active = $${idx++}`); args.push(fields.active); }

  if (sets.length === 0) return getUser(userId);

  args.push(userId);
  const [row] = await query<UserRow>(
    `UPDATE users SET ${sets.join(", ")} WHERE id = $${idx} RETURNING
     id, email, full_name, role, student_number, staff_number, active, created_at`,
    args
  );
  return row ?? null;
}

export async function deleteUser(userId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [userId]
  );
  return rows.length > 0;
}

export async function createAdmin(
  fullName: string,
  email: string,
  password: string
): Promise<UserRow> {
  const existing = await queryOne<{ id: string }>("SELECT id FROM users WHERE email = $1", [email]);
  if (existing) throw { status: 409, message: "Email already registered" };

  const hash = await hashPassword(password);
  const [user] = await query<UserRow>(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'ADMIN')
     RETURNING id, email, full_name, role, student_number, staff_number, active, created_at`,
    [email, hash, fullName]
  );
  return user;
}

export async function listAllClasses() {
  return query<{
    id: string;
    class_code: string;
    subject_name: string;
    venue: string | null;
    scheduled_at: string;
    lecturer_name: string;
    total_attended: number;
    flagged_count: number;
  }>(
    `SELECT c.id, c.class_code, c.subject_name, c.venue, c.scheduled_at,
            u.full_name AS lecturer_name,
            COUNT(ar.id) AS total_attended,
            COUNT(ar.id) FILTER (WHERE ar.flagged = TRUE) AS flagged_count
     FROM classes c
     JOIN users u ON u.id = c.lecturer_id
     LEFT JOIN attendance_records ar ON ar.class_id = c.id
     GROUP BY c.id, u.full_name
     ORDER BY c.scheduled_at DESC`
  );
}

export async function listAllAttendance(classId?: string) {
  const filter = classId ? "WHERE ar.class_id = $1" : "";
  const args = classId ? [classId] : [];

  return query<{
    id: string;
    class_code: string;
    subject_name: string;
    student_name: string;
    student_number: string;
    captured_at: string;
    flagged: boolean;
    flag_reason: string | null;
  }>(
    `SELECT ar.id, c.class_code, c.subject_name,
            u.full_name AS student_name, u.student_number,
            ar.captured_at, ar.flagged, ar.flag_reason
     FROM attendance_records ar
     JOIN classes c ON c.id = ar.class_id
     JOIN users u ON u.id = ar.student_id
     ${filter}
     ORDER BY ar.captured_at DESC`,
    args
  );
}

export async function listPushLogs() {
  return query<{
    id: string;
    class_id: string;
    class_code: string;
    pushed_at: string;
    status: string;
    http_status: number | null;
  }>(
    `SELECT pl.id, pl.class_id, c.class_code, pl.pushed_at, pl.status, pl.http_status
     FROM admin_push_logs pl
     JOIN classes c ON c.id = pl.class_id
     ORDER BY pl.pushed_at DESC`
  );
}
