import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminApi from "../../api/admin.api.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import type { AdminClass } from "../../types/index.ts";

export default function AdminDashboardPage() {
  const { logoutFn } = useAuth();
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listAllClasses().then((r) => setClasses(r.data.classes)).finally(() => setLoading(false));
  }, []);

  const totalRecords = classes.reduce((s, c) => s + (c.attendance_count ?? 0), 0);
  const totalFlagged = classes.reduce((s, c) => s + (c.flagged_count ?? 0), 0);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>Attendance Admin</span>
        <nav style={{ display: "flex", gap: 20 }}>
          {[["Users", "/admin/users"], ["Classes", "/admin/classes"], ["Attendance", "/admin/attendance"], ["Push Logs", "/admin/push-logs"]].map(([label, path]) => (
            <Link key={path} to={path} style={styles.navLink}>{label}</Link>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={logoutFn}>Sign Out</button>
      </header>
      <main style={styles.main}>
        <h2 style={styles.heading}>Admin Dashboard</h2>
        <div style={styles.statsRow}>
          {[["Total Classes", classes.length], ["Total Attendance", totalRecords], ["Flagged Records", totalFlagged]].map(([label, val]) => (
            <div key={label as string} style={{ ...styles.stat, ...(label === "Flagged Records" && totalFlagged > 0 ? { borderTop: "3px solid #ef4444" } : {}) }}>
              <div style={styles.statValue}>{val}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Classes</h3>
          {loading ? <p>Loading…</p> : (
            <table style={styles.table}>
              <thead><tr>{["Code", "Subject", "Lecturer", "Attendance", "Flagged"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>
                {classes.slice(0, 8).map((c) => (
                  <tr key={c.id}>
                    <td style={styles.td}>{c.class_code}</td>
                    <td style={styles.td}>{c.subject_name}</td>
                    <td style={styles.td}>{c.lecturer_name}</td>
                    <td style={styles.td}>{c.attendance_count}</td>
                    <td style={{ ...styles.td, color: c.flagged_count > 0 ? "#ef4444" : undefined }}>{c.flagged_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f0f4f8" },
  header: { background: "#1a3a5c", color: "#fff", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 24 },
  brand: { fontWeight: 700, fontSize: 18, marginRight: "auto" },
  navLink: { color: "rgba(255,255,255,.85)", textDecoration: "none", fontSize: 14 },
  logoutBtn: { background: "transparent", border: "1px solid rgba(255,255,255,.5)", color: "#fff", padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13 },
  main: { maxWidth: 1000, margin: "0 auto", padding: "32px 16px" },
  heading: { fontSize: 24, color: "#1a3a5c", marginBottom: 24 },
  statsRow: { display: "flex", gap: 16, marginBottom: 32 },
  stat: { background: "#fff", borderRadius: 10, padding: "20px 28px", flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 700, color: "#1a3a5c" },
  statLabel: { fontSize: 13, color: "#888", marginTop: 4 },
  section: { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  sectionTitle: { fontSize: 16, color: "#1a3a5c", marginBottom: 16 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
};
