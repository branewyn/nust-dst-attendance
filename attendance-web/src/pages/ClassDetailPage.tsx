import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import * as classesApi from "../api/classes.api.ts";
import QRCodeDisplay from "../components/QRCodeDisplay.tsx";
import AttendanceTable from "../components/AttendanceTable.tsx";
import type { ClassItem, AttendanceList } from "../types/index.ts";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceList | null>(null);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([classesApi.getClass(id), classesApi.getAttendance(id)]).then(([c, a]) => {
      setCls(c.data);
      setAttendance(a.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = async () => {
    if (!id) return;
    const blob = await classesApi.downloadReport(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${cls?.class_code ?? id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pushAdmin = async () => {
    if (!id) return;
    setPushMsg(null);
    try {
      await classesApi.pushToAdmin(id);
      setPushMsg("Pushed to admin store successfully.");
    } catch {
      setPushMsg("Push failed. Check server logs.");
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Loading…</div>;
  if (!cls) return <div style={{ padding: 32 }}>Class not found.</div>;

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <Link to="/classes" style={{ fontSize: 13, color: "#64748b" }}>← Classes</Link>
      </div>

      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{cls.class_code} — {cls.subject_name}</h2>
          <p style={styles.meta}>{cls.venue ?? "No venue"} · {new Date(cls.scheduled_at).toLocaleString()}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={styles.actionBtn} onClick={downloadPdf}>Download PDF</button>
          <button style={{ ...styles.actionBtn, background: "#0f766e" }} onClick={pushAdmin}>Push to Admin</button>
        </div>
      </div>
      {pushMsg && <p style={{ fontSize: 13, color: "#1d4ed8", marginBottom: 12 }}>{pushMsg}</p>}

      <div style={styles.layout}>
        <div style={{ flex: 1 }}>
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                Attendance ({attendance?.total_records ?? 0} records
                {attendance?.flagged_count ? `, ${attendance.flagged_count} flagged` : ""})
              </h3>
              <label style={{ fontSize: 13, color: "#64748b" }}>
                <input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} style={{ marginRight: 6 }} />
                Flagged only
              </label>
            </div>
            <AttendanceTable records={attendance?.records ?? []} showFlaggedOnly={flaggedOnly} />
          </div>
        </div>
        <div style={{ width: 300, flexShrink: 0 }}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>QR Code</h3>
            <QRCodeDisplay qrToken={cls.qr_token} classCode={cls.class_code} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "24px 32px" },
  topBar: { marginBottom: 16 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 22, color: "#1a3a5c", margin: 0 },
  meta: { color: "#64748b", fontSize: 13, marginTop: 6 },
  actionBtn: { background: "#1a3a5c", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  layout: { display: "flex", gap: 24, alignItems: "flex-start" },
  section: { background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)", marginBottom: 16 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 15, color: "#1a3a5c", margin: 0 },
};
