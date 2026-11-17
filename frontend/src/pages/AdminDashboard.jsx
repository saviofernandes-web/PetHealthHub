import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vets, setVets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState("stats");

  const loadAll = async () => {
    const [statsRes, usersRes, vetsRes, reqRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/vets"),
      api.get("/ambulance"),
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data);
    setVets(vetsRes.data);
    setRequests(reqRes.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const removeVet = async (id) => {
    if (!confirm("Remove this clinic listing?")) return;
    await api.delete(`/admin/vets/${id}`);
    loadAll();
  };

  const removeUser = async (id) => {
    if (!confirm("Remove this user account?")) return;
    await api.delete(`/admin/users/${id}`);
    loadAll();
  };

  const updateRequestStatus = async (id, status) => {
    await api.put(`/ambulance/${id}/status`, { status });
    loadAll();
  };

  return (
    <div>
      <div className="hero-panel">
        <h1>Admin Panel</h1>
        <p>Oversee registered pet owners, clinics, and emergency requests across PetHealth Hub.</p>
        <span className="hero-mark">📋</span>
      </div>

      <div className="tab-row">
        <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>Overview</button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
        <button className={tab === "vets" ? "active" : ""} onClick={() => setTab("vets")}>Clinics</button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>Ambulance Requests</button>
      </div>

      {tab === "stats" && stats && (
        <div className="grid-3">
          <div className="card stat-box"><div className="num">{stats.userCount}</div><div className="muted">Pet Owners</div></div>
          <div className="card stat-box"><div className="num">{stats.vetCount}</div><div className="muted">Registered Clinics</div></div>
          <div className="card stat-box"><div className="num">{stats.pendingRequests}</div><div className="muted">Pending Ambulance Requests</div></div>
        </div>
      )}

      {tab === "users" && (
        <div className="card">
          <h3>Registered Pet Owners</h3>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td><button className="btn btn-danger" onClick={() => removeUser(u._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "vets" && (
        <div className="card">
          <h3>Registered Clinics</h3>
          <table>
            <thead><tr><th>Clinic</th><th>Email</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {vets.map((v) => (
                <tr key={v._id}>
                  <td>{v.clinicName}</td>
                  <td>{v.email}</td>
                  <td>
                    <span className={`badge ${v.isAvailable ? "badge-available" : "badge-unavailable"}`}>
                      {v.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td><button className="btn btn-danger" onClick={() => removeVet(v._id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "requests" && (
        <div className="card">
          <h3>Ambulance Requests</h3>
          {requests.map((r) => (
            <div className="clinic-item" key={r._id}>
              <div>
                <strong>{r.petName || "Pet"}</strong> — {r.location}
                <div className="muted">{r.user?.name} · {r.contactNumber}</div>
                <div className="muted">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateRequestStatus(r._id, e.target.value)}
                style={{ padding: 6, borderRadius: 6 }}
              >
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
