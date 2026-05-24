export interface User {
  id: string;
  full_name: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  student_number?: string | null;
  staff_number?: string | null;
  active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: Pick<User, "id" | "full_name" | "role">;
}

export interface ClassItem {
  id: string;
  class_code: string;
  subject_name: string;
  venue: string | null;
  scheduled_at: string;
  challenge_required: boolean;
  qr_token: string;
  created_at: string;
}

export interface AttendanceRecord {
  student_id: string;
  full_name: string;
  student_number: string;
  captured_at: string;
  latitude: number;
  longitude: number;
  device_model: string;
  os: string;
  flagged: boolean;
  flag_reason: string | null;
}

export interface AttendanceList {
  class_id: string;
  class_code: string;
  subject_name: string;
  scheduled_at: string;
  total_attended: number;
  flagged_count: number;
  records: AttendanceRecord[];
}

export interface AdminClass {
  id: string;
  class_code: string;
  subject_name: string;
  venue: string | null;
  scheduled_at: string;
  lecturer_name: string;
  total_attended: number;
  flagged_count: number;
}

export interface PushLog {
  id: string;
  class_id: string;
  class_code: string;
  pushed_at: string;
  status: "SUCCESS" | "FAILED";
  http_status: number | null;
}
