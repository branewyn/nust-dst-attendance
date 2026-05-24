import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as classesApi from "../api/classes.api.ts";

export default function CreateClassPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    class_code: "",
    subject_name: "",
    venue: "",
    scheduled_at: "",
    challenge_code: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await classesApi.createClass({
        class_code: form.class_code,
        subject_name: form.subject_name,
        venue: form.venue || undefined,
        scheduled_at: form.scheduled_at,
        challenge_code: form.challenge_code || undefined,
      });
      navigate(`/classes/${data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={styles.heading}>Create New Class</h2>
          <Link to="/classes" style={{ fontSize: 13, color: "#64748b" }}>← Back</Link>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {[
            { label: "Class Code", field: "class_code", type: "text", placeholder: "e.g. DST301", required: true },
            { label: "Subject Name", field: "subject_name", type: "text", placeholder: "e.g. Design Thinking", required: true },
            { label: "Venue", field: "venue", type: "text", placeholder: "e.g. Block A Room 204", required: false },
            { label: "Scheduled Date & Time", field: "scheduled_at", type: "datetime-local", placeholder: "", required: true },
            { label: "Challenge Code (optional)", field: "challenge_code", type: "text", placeholder: "e.g. BLUE42 — leave blank for none", required: false },
          ].map(({ label, field, type, placeholder, required }) => (
            <div key={field}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                type={type}
                placeholder={placeholder}
                value={form[field as keyof typeof form]}
                onChange={set(field)}
                required={required}
              />
            </div>
          ))}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Class"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 520, margin: "40px auto", padding: "0 16px" },
  card: { background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 4px 20px rgba(0,0,0,.08)" },
  heading: { fontSize: 20, color: "#1a3a5c", margin: 0 },
  label: { display: "block", marginBottom: 4, fontSize: 13, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", marginBottom: 16, fontSize: 14, boxSizing: "border-box" },
  button: { width: "100%", padding: 12, background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" },
  error: { background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 },
};
