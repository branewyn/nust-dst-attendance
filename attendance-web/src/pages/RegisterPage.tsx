import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function RegisterPage() {
  const { registerLecturerFn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", staff_number: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    setError(null);
    setLoading(true);
    try {
      await registerLecturerFn({ full_name: form.full_name, staff_number: form.staff_number, email: form.email, password: form.password });
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Attendance System</h1>
        <h2 style={styles.subtitle}>Lecturer Registration</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {[
            { label: "Full Name", field: "full_name", type: "text" },
            { label: "Staff Number", field: "staff_number", type: "text" },
            { label: "Email", field: "email", type: "email" },
            { label: "Password", field: "password", type: "password" },
            { label: "Confirm Password", field: "confirm", type: "password" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label style={styles.label}>{label}</label>
              <input style={styles.input} type={type} value={form[field as keyof typeof form]} onChange={set(field)} required />
            </div>
          ))}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Registering…" : "Register"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center" }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" },
  card: { background: "#fff", borderRadius: 12, padding: 40, width: 380, boxShadow: "0 4px 20px rgba(0,0,0,.1)" },
  title: { textAlign: "center", marginBottom: 4, fontSize: 22, color: "#1a3a5c" },
  subtitle: { textAlign: "center", marginBottom: 24, fontSize: 16, color: "#555", fontWeight: 400 },
  label: { display: "block", marginBottom: 4, fontSize: 13, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", marginBottom: 16, fontSize: 14, boxSizing: "border-box" },
  button: { width: "100%", padding: 12, background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" },
  error: { background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 },
};
