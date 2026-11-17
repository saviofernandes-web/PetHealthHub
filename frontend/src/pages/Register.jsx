import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [mode, setMode] = useState("user"); // user | vet
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // shared
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  // user-only
  const [name, setName] = useState("");

  // vet-only
  const [clinicName, setClinicName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload =
        mode === "user"
          ? { name, email, password, phone }
          : {
              clinicName,
              ownerName,
              email,
              password,
              phone,
              address,
              services: services.split(",").map((s) => s.trim()).filter(Boolean),
            };

      const { data } = await api.post(`/auth/register/${mode}`, payload);
      login(data);
      navigate(mode === "user" ? "/dashboard" : "/vet-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card">
        <h2>Create an account</h2>

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
          {mode === "user" ? (
            <div className="form-group">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Clinic / hospital name</label>
                <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Owner / vet name</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Clinic address</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Services (comma separated)</label>
                <input
                  placeholder="Vaccination, Surgery, Grooming"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                />
              </div>
              <p className="muted" style={{ marginTop: -8, marginBottom: 14 }}>
                Note: for this demo, location coordinates default to (0,0). Update your clinic's
                exact coordinates later from the Clinic Dashboard, or set them directly in the
                database. See README for details.
              </p>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
