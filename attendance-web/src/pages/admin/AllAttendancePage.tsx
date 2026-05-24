import { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api.ts";
import type { AttendanceRecord } from "../../types/index.ts";

export default function AllAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  useEffect(() => {
    adminApi.listAllAttendance({ flaggedOnly }).then((r) => setRecords(r.data.records)).finally(() => setLoading(false));
  }, [flaggedOnly]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>All Attendance Records</h2>
        <label style={{ fontSize: 13 }}>
          <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} style={{ marginRight: 6 }} />
          Flagged only
        </label>
      </div>
      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>{["Student", "Student #", "Class", "Code", "Time", "Lat", "Lng", "Flagged", "Reason"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={r.flagged ? { background: "rgb(255,240,240)" } : undefined}>
                  <td style={styles.td}>{r.full_name}</td>
                  <td style={styles.td}>{r.student_number}</td>
                  <td style={styles.td}>{r.subject_name}</td>
                  <td style={styles.td}>{r.class_code}</td>
                  <td style={styles.td}>{new Date(r.captured_at).toLocaleString()}</td>
                  <td style={styles.td}>{r.latitude.toFixed(5)}</td>
                  <td style={styles.td}>{r.longitude.toFixed(5)}</td>
                  <td style={styles.td}>{r.flagged ? "Yes" : "No"}</td>
                  <td style={styles.td}>{r.flag_reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1300, margin: "0 auto", padding: "24px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  heading: { fontSize: 22, color: "#1a3a5c", margin: 0 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13, whiteSpace: "nowrap" },
};
