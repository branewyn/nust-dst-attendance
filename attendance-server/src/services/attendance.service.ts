import { query, queryOne } from "../db.ts";
import { verifyQrToken } from "../utils/qr-token.ts";
import type { DeviceInfo } from "../utils/device-crypto.ts";

export async function captureAttendance(
  studentId: string,
  qrToken: string,
  challengeCode: string | undefined,
  latitude: number,
  longitude: number,
  device: DeviceInfo
) {
  // 1. Verify QR token
  let qrPayload;
  try {
    qrPayload = await verifyQrToken(qrToken);
  } catch {
    throw { status: 400, message: "Invalid QR token" };
  }

  const { class_id, challenge_required } = qrPayload;

  // 2. Load class and verify challenge if needed
  const cls = await queryOne<{
    id: string;
    class_code: string;
    subject_name: string;
    challenge_code: string | null;
    challenge_required: boolean;
  }>(
    "SELECT id, class_code, subject_name, challenge_code, challenge_required FROM classes WHERE id = $1",
    [class_id]
  );
  if (!cls) throw { status: 404, message: "Class not found" };

  if (challenge_required || cls.challenge_required) {
    if (!challengeCode) throw { status: 422, message: "Challenge code is required for this class" };
    if (challengeCode.trim().toUpperCase() !== (cls.challenge_code ?? "").trim().toUpperCase()) {
      throw { status: 400, message: "Incorrect challenge code" };
    }
  }

  // 3. Check for duplicate
  const duplicate = await queryOne<{ id: string }>(
    "SELECT id FROM attendance_records WHERE class_id = $1 AND student_id = $2",
    [class_id, studentId]
  );
  if (duplicate) throw { status: 409, message: "Attendance already captured for this class" };

  // 4. Device conflict detection
  const deviceConflictInRecords = await queryOne<{ student_id: string }>(
    `SELECT student_id FROM attendance_records
     WHERE device_fingerprint = $1 AND student_id != $2 LIMIT 1`,
    [device.device_fingerprint, studentId]
  );
  const deviceConflictInDevices = await queryOne<{ user_id: string }>(
    `SELECT user_id FROM devices
     WHERE device_fingerprint = $1 AND user_id != $2 LIMIT 1`,
    [device.device_fingerprint, studentId]
  );

  const flagged = !!(deviceConflictInRecords || deviceConflictInDevices);
  const flagReason = flagged ? "DEVICE_CONFLICT" : null;

  // 5. Insert record
  const [record] = await query<{ id: string; captured_at: string }>(
    `INSERT INTO attendance_records
       (class_id, student_id, device_fingerprint, device_model, os, os_version,
        app_version, latitude, longitude, flagged, flag_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, captured_at`,
    [
      class_id,
      studentId,
      device.device_fingerprint,
      device.device_model,
      device.os,
      device.os_version,
      device.app_version,
      latitude,
      longitude,
      flagged,
      flagReason,
    ]
  );

  // 6. Update device last_seen_at
  await query(
    `UPDATE devices SET last_seen_at = NOW()
     WHERE user_id = $1 AND device_fingerprint = $2`,
    [studentId, device.device_fingerprint]
  );

  return {
    id: record.id,
    class_id,
    class_code: cls.class_code,
    subject_name: cls.subject_name,
    captured_at: record.captured_at,
    flagged,
  };
}

export async function getAttendanceHistory(studentId: string) {
  return query<{
    id: string;
    class_code: string;
    subject_name: string;
    venue: string | null;
    lecturer_name: string;
    scheduled_at: string;
    captured_at: string;
    flagged: boolean;
  }>(
    `SELECT ar.id, c.class_code, c.subject_name, c.venue,
            u.full_name AS lecturer_name, c.scheduled_at, ar.captured_at, ar.flagged
     FROM attendance_records ar
     JOIN classes c ON c.id = ar.class_id
     JOIN users u ON u.id = c.lecturer_id
     WHERE ar.student_id = $1
     ORDER BY ar.captured_at DESC`,
    [studentId]
  );
}
