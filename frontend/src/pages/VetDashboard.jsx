import { useEffect, useState } from "react";
import api from "../api/axios";

const VetDashboard = () => {
  const [vet, setVet] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [clinicName, setClinicName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [services, setServices] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const loadProfile = async () => {
    const { data } = await api.get("/vets/me");
    setVet(data);
    setClinicName(data.clinicName || "");
    setOwnerName(data.ownerName || "");
    setPhone(data.phone || "");
    setAddress(data.address || "");
    setServices((data.services || []).join(", "));
    setLat(data.location?.coordinates?.[1] || "");
    setLng(data.location?.coordinates?.[0] || "");
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const toggleAvailability = async () => {
    const { data } = await api.put("/vets/me/availability", { isAvailable: !vet.isAvailable });
    setVet((prev) => ({ ...prev, isAvailable: data.isAvailable }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLat(pos.coords.latitude);
      setLng(pos.coords.longitude);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const { data } = await api.put("/vets/me", {
        clinicName,
        ownerName,
        phone,
        address,
        services: services.split(",").map((s) => s.trim()).filter(Boolean),
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });
      setVet(data);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (!vet) return <p>Loading...</p>;

  return (
    <div>
      <div className="hero-panel">
        <h1>{vet.clinicName}</h1>
        <p>Keep your profile and availability up to date so pet owners nearby can find and reach you.</p>
        <span className="hero-mark">🏥</span>
      </div>

      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>Availability status</h3>
          <span className={`badge ${vet.isAvailable ? "badge-available" : "badge-unavailable"}`}>
            {vet.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
        <button className="btn btn-primary" onClick={toggleAvailability}>
          Mark as {vet.isAvailable ? "Unavailable" : "Available"}
        </button>
      </div>

      <div className="card">
        <h3>Clinic profile</h3>
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Clinic name</label>
            <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Owner / vet name</label>
            <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Services (comma separated)</label>
            <input value={services} onChange={(e) => setServices(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Location coordinates (used for nearby search)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <input placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
              <button type="button" className="btn btn-outline" onClick={useMyLocation}>
                Use my location
              </button>
            </div>
          </div>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VetDashboard;
