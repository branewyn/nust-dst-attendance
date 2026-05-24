import { api } from "./client.ts";
import type { ClassItem, AttendanceList } from "../types/index.ts";

export const createClass = (data: {
  class_code: string;
  subject_name: string;
  venue?: string;
  scheduled_at: string;
  challenge_code?: string;
}) => api.post<ClassItem>("/classes", data);

export const listClasses = () =>
  api.get<{ classes: ClassItem[] }>("/classes");

export const getClass = (id: string) =>
  api.get<ClassItem>(`/classes/${id}`);

export const updateClass = (id: string, data: Partial<ClassItem & { challenge_code: string | null }>) =>
  api.put<ClassItem>(`/classes/${id}`, data);

export const deleteClass = (id: string) =>
  api.delete(`/classes/${id}`);

export const getAttendance = (id: string, flaggedOnly = false) =>
  api.get<AttendanceList>(`/classes/${id}/attendance${flaggedOnly ? "?flagged=true" : ""}`);

export const downloadReport = (id: string) =>
  api.get(`/classes/${id}/report`, { responseType: "blob" });

export const pushToAdmin = (id: string) =>
  api.post(`/classes/${id}/push-admin`);
