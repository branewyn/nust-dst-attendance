import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { useClasses } from "../hooks/useClasses.ts";

export default function DashboardPage() {
  const { user, logoutFn } = useAuth();
  const { classes, loading } = useClasses();

  const upcoming = classes.filter((c) => new Date(c.scheduled_at) >= new Date());
  const totalFlagged = 0; // placeholder — fetched per-class

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.brand}>Attendance System</span>
        <span style={styles.userInfo}>{user?.full_name} ({user?.role})</span>
        <button style={styles.logoutBtn} onClick={logoutFn}>Sign Out</button>
      </header>
      <main style={styles.main}>
        <h2 style={styles.heading}>Dashboard</h2>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{classes.length}</div>
            <div style={styles.statLabel}>Total Classes</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{upcoming.length}</div>
            <div style={styles.statLabel}>Upcoming</div>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Classes</h3>
            <Link to="/classes/new" style={styles.newBtn}>+ New Class</Link>
          </div>
          {loading ? (
            <p>Loading…</p>
          ) : classes.length === 0 ? (
            <p style={{ color: "#888" }}>No classes yet. <Link to="/classes/new">Create your first class.</Link></p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Code", "Subject", "Venue", "Scheduled", ""].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.slice(0, 5).map((cls) => (
                  <tr key={cls.id}>
                    <td style={styles.td}>{cls.class_code}</td>
                    <td style={styles.td}>{cls.subject_name}</td>
                    <td style={styles.td}>{cls.venue ?? "—"}</td>
                    <td style={styles.td}>{new Date(cls.scheduled_at).toLocaleString()}</td>
                    <td style={styles.td}><Link to={`/classes/${cls.id}`}>View</Link></td>
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
  header: { background: "#1a3a5c", color: "#fff", padding: "0 32px", height: 56, display: "flex", alignItems: "center", gap: 16 },
  brand: { fontWeight: 700, fontSize: 18, flex: 1 },
  userInfo: { fontSize: 14, opacity: 0.85 },
  logoutBtn: { background: "transparent", border: "1px solid rgba(255,255,255,.5)", color: "#fff", padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13 },
  main: { maxWidth: 900, margin: "0 auto", padding: "32px 16px" },
  heading: { fontSize: 24, marginBottom: 24, color: "#1a3a5c" },
  statsRow: { display: "flex", gap: 16, marginBottom: 32 },
  stat: { background: "#fff", borderRadius: 10, padding: "20px 28px", flex: 1, boxShadow: "0 2px 8px rgba(0,0,0,.06)", textAlign: "center" },
  statValue: { fontSize: 32, fontWeight: 700, color: "#1a3a5c" },
  statLabel: { fontSize: 13, color: "#888", marginTop: 4 },
  section: { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  sectionTitle: { fontSize: 16, margin: 0, color: "#1a3a5c" },
  newBtn: { background: "#1a3a5c", color: "#fff", padding: "7px 14px", borderRadius: 6, textDecoration: "none", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "8px 12px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontSize: 14 },
};
