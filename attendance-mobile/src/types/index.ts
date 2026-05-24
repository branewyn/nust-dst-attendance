export interface User {
  id: string;
  email: string;
  full_name: string;
  student_number?: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AttendanceRecord {
  id: string;
  class_id: string;
  class_code: string;
  subject_name: string;
  captured_at: string;
  latitude: number;
  longitude: number;
  flagged: boolean;
  flag_reason: string | null;
}

export interface CaptureAttendanceInput {
  qr_token: string;
  challenge_response?: string;
  latitude: number;
  longitude: number;
}

export interface CaptureAttendanceResult {
  message: string;
  attendance_id: string;
  flagged: boolean;
  flag_reason?: string;
}
