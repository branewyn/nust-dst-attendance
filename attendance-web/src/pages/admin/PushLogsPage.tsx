import { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api.ts";
import type { PushLog } from "../../types/index.ts";

export default function PushLogsPage() {
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listPushLogs().then((r) => setLogs(r.data.logs)).finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Admin Push Logs</h2>
      {loading ? <p>Loading…</p> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Class", "Time", "HTTP Status", "Success", "Error"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={l.status === "FAILED" ? { background: "rgb(255,245,245)" } : undefined}>
                <td style={styles.td}>{l.class_id}</td>
                <td style={styles.td}>{new Date(l.pushed_at).toLocaleString()}</td>
                <td style={styles.td}>{l.http_status ?? "—"}</td>
                <td style={{ ...styles.td, color: l.status === "SUCCESS" ? "#16a34a" : "#ef4444" }}>{l.status === "SUCCESS" ? "Yes" : "No"}</td>
                <td style={styles.td}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1000, margin: "0 auto", padding: "24px 32px" },
  heading: { fontSize: 22, color: "#1a3a5c", marginBottom: 24 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
};
