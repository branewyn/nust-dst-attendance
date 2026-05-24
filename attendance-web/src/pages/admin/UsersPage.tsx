import { useEffect, useState } from "react";
import * as adminApi from "../../api/admin.api.ts";
import type { User } from "../../types/index.ts";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ full_name: "", email: "", password: "" });
  const [createError, setCreateError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminApi.listUsers().then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (id: string, active: boolean) => {
    await adminApi.updateUser(id, { active: !active });
    load();
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      await adminApi.createAdmin(newAdmin);
      setShowCreate(false);
      setNewAdmin({ full_name: "", email: "", password: "" });
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setCreateError(msg ?? "Failed to create admin");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Users</h2>
        <button style={styles.btn} onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancel" : "+ New Admin"}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateAdmin} style={styles.createForm}>
          <h4 style={{ margin: "0 0 12px", color: "#1a3a5c" }}>Create Admin Account</h4>
          {createError && <p style={styles.error}>{createError}</p>}
          {[
            { label: "Full Name", field: "full_name", type: "text" },
            { label: "Email", field: "email", type: "email" },
            { label: "Password", field: "password", type: "password" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type={type} value={newAdmin[field as keyof typeof newAdmin]}
                onChange={(e) => setNewAdmin((f) => ({ ...f, [field]: e.target.value }))} required />
            </div>
          ))}
          <button style={styles.btn} type="submit">Create Admin</button>
        </form>
      )}

      {loading ? <p>Loading…</p> : (
        <table style={styles.table}>
          <thead>
            <tr>{["Name", "Email", "Role", "Active", "Joined", "Actions"].map((h) => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={styles.td}>{u.full_name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>
                  <span style={{ color: u.active ? "#16a34a" : "#ef4444" }}>{u.active ? "Yes" : "No"}</span>
                </td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button style={styles.linkBtn} onClick={() => toggleActive(u.id, u.active)}>
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
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
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  heading: { fontSize: 22, color: "#1a3a5c", margin: 0 },
  btn: { background: "#1a3a5c", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  createForm: { background: "#fff", borderRadius: 10, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)", maxWidth: 400 },
  label: { display: "block", fontSize: 13, marginBottom: 4 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #ccc", borderRadius: 6, marginBottom: 14, fontSize: 14, boxSizing: "border-box" },
  error: { color: "#b91c1c", fontSize: 13, marginBottom: 12 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.06)" },
  th: { textAlign: "left", padding: "10px 14px", background: "#f8fafc", borderBottom: "2px solid #e2e8f0", fontSize: 12, color: "#64748b" },
  td: { padding: "10px 14px", borderBottom: "1px solid #f1f5f9", fontSize: 13 },
  linkBtn: { background: "none", border: "none", color: "#1a3a5c", cursor: "pointer", fontSize: 13, fontWeight: 600 },
};
