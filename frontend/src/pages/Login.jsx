import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [mode, setMode] = useState("user"); // user | vet
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/login/${mode}`, { email, password });
      login(data);
      if (data.role === "vet") navigate("/vet-dashboard");
      else if (data.role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h2>Log in to PetHealth Hub</h2>

        <div className="tab-row">
          <button type="button" className={mode === "user" ? "active" : ""} onClick={() => setMode("user")}>
            Pet Owner
          </button>
          <button type="button" className={mode === "vet" ? "active" : ""} onClick={() => setMode("vet")}>
            Vet / Clinic
          </button>
        </div>

        {error && <div className="error-text">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 14 }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="muted">
          Are you an admin? Log in with the "Pet Owner" tab using your admin email — access is
          role-based on the backend.
        </p>
      </div>
    </div>
  );
};

export default Login;
