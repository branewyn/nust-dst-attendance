import { Link } from "react-router-dom";
import { useClasses } from "../hooks/useClasses.ts";
import * as classesApi from "../api/classes.api.ts";

export default function ClassesPage() {
  const { classes, loading, error, refetch } = useClasses();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class and all its attendance records?")) return;
    await classesApi.deleteClass(id);
    refetch();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>My Classes</h2>
        <Link to="/classes/new" style={styles.newBtn}>+ New Class</Link>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && classes.length === 0 && (
        <p style={{ color: "#888" }}>No classes yet.</p>
      )}

      <div style={styles.grid}>
        {classes.map((cls) => (
          <div key={cls.id} style={styles.card}>
            <div style={styles.cardTop}>
              <span style={styles.code}>{cls.class_code}</span>
              {cls.challenge_required && (
                <span style={styles.badge}>Challenge</span>
              )}
            </div>
            <div style={styles.subject}>{cls.subject_name}</div>
            <div style={styles.meta}>{cls.venue ?? "No venue"}</div>
            <div style={styles.meta}>{new Date(cls.scheduled_at).toLocaleString()}</div>
            <div style={styles.actions}>
              <Link to={`/classes/${cls.id}`} style={styles.actionLink}>Attendance</Link>
              <button style={styles.deleteBtn} onClick={() => handleDelete(cls.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { padding: "24px 32px", maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  heading: { fontSize: 22, color: "#1a3a5c", margin: 0 },
  newBtn: { background: "#1a3a5c", color: "#fff", padding: "9px 18px", borderRadius: 6, textDecoration: "none", fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,.07)" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  code: { fontWeight: 700, color: "#1a3a5c", fontSize: 15 },
  badge: { background: "#dbeafe", color: "#1d4ed8", fontSize: 11, padding: "2px 8px", borderRadius: 10 },
  subject: { fontSize: 15, marginBottom: 8 },
  meta: { fontSize: 13, color: "#64748b", marginBottom: 4 },
  actions: { display: "flex", gap: 10, marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 12 },
  actionLink: { fontSize: 13, color: "#1a3a5c", textDecoration: "none", fontWeight: 600 },
  deleteBtn: { background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 13, marginLeft: "auto" },
};
