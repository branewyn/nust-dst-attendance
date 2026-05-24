import client from "./client";
import type { CaptureAttendanceInput, CaptureAttendanceResult, AttendanceRecord } from "../types";
import { getDeviceInfoHeader } from "../utils/device";

export async function captureAttendance(payload: CaptureAttendanceInput): Promise<CaptureAttendanceResult> {
  const deviceHeader = await getDeviceInfoHeader();
  const { data } = await client.post<CaptureAttendanceResult>("/attendance/capture", payload, {
    headers: { "X-Device-Info": deviceHeader },
  });
  return data;
}

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const { data } = await client.get<{ records: AttendanceRecord[] }>("/attendance/history");
  return data.records;
}
