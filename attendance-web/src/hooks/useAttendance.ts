import { useState, useEffect, useCallback } from "react";
import * as classesApi from "../api/classes.api.ts";
import type { AttendanceList } from "../types/index.ts";

export function useAttendance(classId: string) {
  const [data, setData] = useState<AttendanceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await classesApi.getAttendance(classId);
      setData(res);
    } catch {
      setError("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => { if (classId) fetch(); }, [classId, fetch]);

  return { data, loading, error, refetch: fetch };
}
