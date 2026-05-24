import { useState, useEffect, useCallback } from "react";
import * as classesApi from "../api/classes.api.ts";
import type { ClassItem } from "../types/index.ts";

export function useClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await classesApi.listClasses();
      setClasses(data.classes);
    } catch {
      setError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { classes, loading, error, refetch: fetch };
}
