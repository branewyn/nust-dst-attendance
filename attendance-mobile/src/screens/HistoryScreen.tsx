import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import * as attendanceApi from "../api/attendance.api";
import type { AttendanceRecord } from "../types";

export default function HistoryScreen() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attendanceApi.getAttendanceHistory()
      .then(setRecords)
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.centered}><ActivityIndicator size="large" color="#1a3a5c" /></View>;
  if (error) return <View style={s.centered}><Text style={{ color: "#ef4444" }}>{error}</Text></View>;
  if (records.length === 0) return <View style={s.centered}><Text style={{ color: "#888" }}>No attendance records yet.</Text></View>;

  return (
    <FlatList
      data={records}
      keyExtractor={(r) => r.id}
      contentContainerStyle={s.list}
      renderItem={({ item }) => (
        <View style={[s.card, item.flagged && s.flaggedCard]}>
          <Text style={s.subject}>{item.subject_name}</Text>
          <Text style={s.code}>{item.class_code}</Text>
          <Text style={s.time}>{new Date(item.captured_at).toLocaleString()}</Text>
          {item.flagged && <Text style={s.flagBadge}>⚠ {item.flag_reason}</Text>}
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4f8" },
  list: { padding: 16, backgroundColor: "#f0f4f8" },
  card: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  flaggedCard: { borderLeftWidth: 3, borderLeftColor: "#ef4444" },
  subject: { fontSize: 15, fontWeight: "700", color: "#1a3a5c" },
  code: { fontSize: 12, color: "#64748b", marginTop: 2 },
  time: { fontSize: 13, color: "#555", marginTop: 6 },
  flagBadge: { fontSize: 12, color: "#ef4444", marginTop: 6 },
});
