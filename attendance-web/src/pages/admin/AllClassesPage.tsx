import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminApi from "../../api/admin.api.ts";
import type { AdminClass } from "../../types/index.ts";

export default function AllClassesPage() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listAllClasses().then((r) => setClasses(r.data.classes)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>All Classes</h2>
      {loading ? <p>Loading…</p> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Code", "Subject", "Lecturer", "Venue", "Scheduled", "Attendance", "Flagged"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td style={styles.td}>{c.class_code}</td>
                <td style={styles.td}>{c.subject_name}</td>
                <td style={styles.td}>{c.lecturer_name}</td>
                <td style={styles.td}>{c.venue ?? "—"}</td>
                <td style={styles.td}>{new Date(c.scheduled_at).toLocaleString()}</td>
                <td style={styles.td}>{c.attendance_count}</td>
                <td style={{ ...styles.td, color: c.flagged_count > 0 ? "#ef4444" : undefined }}>{c.flagged_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "24px 32px" },
  heading: { fontSize: 22, color: "#1a3a5c", marginBottom: 24 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
};
