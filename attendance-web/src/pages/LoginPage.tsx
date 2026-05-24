import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function LoginPage() {
  const { loginFn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginFn(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Attendance System</h1>
        <h2 style={styles.subtitle}>Sign In</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label style={styles.label}>Password</label>
          <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: "center" }}>
          New lecturer? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" },
  card: { background: "#fff", borderRadius: 12, padding: 40, width: 360, boxShadow: "0 4px 20px rgba(0,0,0,.1)" },
  title: { textAlign: "center", marginBottom: 4, fontSize: 22, color: "#1a3a5c" },
  subtitle: { textAlign: "center", marginBottom: 24, fontSize: 16, color: "#555", fontWeight: 400 },
  label: { display: "block", marginBottom: 4, fontSize: 13, color: "#333" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #ccc", marginBottom: 16, fontSize: 14, boxSizing: "border-box" },
  button: { width: "100%", padding: 12, background: "#1a3a5c", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, cursor: "pointer" },
  error: { background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 },
};
