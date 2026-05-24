import { api } from "./client.ts";
import type { User, AdminClass, AttendanceRecord, PushLog } from "../types/index.ts";

export const listUsers = (role?: string) =>
  api.get<{ users: User[] }>(`/admin/users${role ? `?role=${role}` : ""}`);

export const getUser = (id: string) =>
  api.get<User>(`/admin/users/${id}`);

export const updateUser = (id: string, data: { full_name?: string; active?: boolean }) =>
  api.put<User>(`/admin/users/${id}`, data);

export const deleteUser = (id: string) =>
  api.delete(`/admin/users/${id}`);

export const createAdmin = (data: { full_name: string; email: string; password: string }) =>
  api.post<User>("/admin/users", data);

export const listAllClasses = () =>
  api.get<{ classes: AdminClass[] }>("/admin/classes");

export const getClassAttendance = (classId: string) =>
  api.get<{ records: AttendanceRecord[] }>(`/admin/classes/${classId}/attendance`);

export const listAllAttendance = (classId?: string) =>
  api.get<{ records: AttendanceRecord[] }>(`/admin/attendance${classId ? `?class_id=${classId}` : ""}`);

export const listPushLogs = () =>
  api.get<{ logs: PushLog[] }>("/admin/push-logs");

export const triggerPush = (classId: string) =>
  api.post(`/admin/classes/${classId}/push-admin`);
