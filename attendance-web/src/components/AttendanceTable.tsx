import type { AttendanceRecord } from "../types/index.ts";

interface Props {
  records: AttendanceRecord[];
  showFlaggedOnly?: boolean;
}

export default function AttendanceTable({ records, showFlaggedOnly }: Props) {
  const rows = showFlaggedOnly ? records.filter((r) => r.flagged) : records;

  if (rows.length === 0) {
    return <p style={{ color: "#888", fontSize: 14 }}>No records found.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {["Student", "Student Number", "Time", "Lat", "Lng", "Flagged", "Flag Reason"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} style={r.flagged ? styles.flaggedRow : undefined}>
              <td style={styles.td}>{r.full_name}</td>
              <td style={styles.td}>{r.student_number}</td>
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
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b", whiteSpace: "nowrap" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
  flaggedRow: { background: "rgb(255, 240, 240)" },
};
