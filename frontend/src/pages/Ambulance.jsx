import { useEffect, useState } from "react";
import api from "../api/axios";

// Real, sourced pet/animal ambulance and rescue helplines for Mumbai, verified
// against each organisation's own site or multiple independent listings as of
// this build. Phone numbers for volunteer/NGO services can change without
// notice, so this is a starting point for reaching help fast - not a
// guarantee. In a genuine emergency, also try calling the nearest 24-hour
// veterinary hospital directly if you already know one.
const VERIFIED_HELPLINES = [
  {
    name: "Bombay SPCA (BSPCA) - Hospital Enquiry",
    number: "+918591659398",
    display: "+91 85916 59398",
    availability: "24 hours",
    note: "Official animal hospital in Parel, Mumbai. Source: bombayspca.org",
  },
  {
    name: "Bombay SPCA (BSPCA) - Ambulance (Parel)",
    number: "+912224137518",
    display: "022-2413 7518",
    availability: "See BSPCA hours",
    note: "Landline, Parel hospital",
  },
  {
    name: "Karuna Animal Helpline",
    number: "+919819100100",
    display: "+91 98191 00100",
    availability: "10am - 7pm",
    note: "Free helpline guiding you to the right NGO/vet for your area",
  },
  {
    name: "Karuna Night Ambulance (maggot-wound cases, on-road only)",
    number: "+919665355404",
    display: "+91 96653 55404",
    availability: "9pm - 3am, Dahisar to Colaba",
    note: "On-road treatment only, not a hospital transport service",
  },
  {
    name: "Vet Saathi - Emergency Animal Transport (Wadala/Sion)",
    number: "+919594313976",
    display: "+91 95943 13976",
    note: "Area-limited pickup service",
  },
  {
    name: "RAWW - Wildlife & Animal Rescue (Mumbai, Thane, Navi Mumbai)",
    number: "+917666680202",
    display: "+91 76666 80202",
    availability: "24 hours",
    note: "Also handles wildlife and reptile rescue",
  },
];

const Ambulance = () => {
  const [petName, setPetName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);

  const loadRequests = async () => {
    try {
      const { data } = await api.get("/ambulance/mine");
      setMyRequests(data);
    } catch {
      // ignore for now
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    let coordinates;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      } catch {
        coordinates = undefined;
      }
    }

    try {
      await api.post("/ambulance", { petName, contactNumber, location, notes, coordinates });
      setSuccess("Request logged. For the fastest response, also call one of the helplines below directly.");
      setPetName("");
      setContactNumber("");
      setLocation("");
      setNotes("");
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit the request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="hero-panel">
        <h1>Pet Ambulance</h1>
        <p>Call a verified helpline directly for the fastest response, or log a request so a clinic partner can follow up.</p>
        <span className="hero-mark">🚑</span>
      </div>

      <div className="card" style={{ borderLeft: "4px solid var(--coral)" }}>
        <h3 style={{ marginBottom: 4 }}>📞 Call directly — fastest option in a real emergency</h3>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Verified Mumbai animal ambulance and rescue helplines. Numbers for volunteer/NGO
          services can change — if one doesn't connect, try the next.
        </p>

        {VERIFIED_HELPLINES.map((h) => (
          <div className="clinic-item" key={h.number}>
            <div>
              <strong>{h.name}</strong>
              <div className="muted">
                {h.availability && `${h.availability} · `}
                {h.note}
              </div>
            </div>
            <a className="btn btn-danger" href={`tel:${h.number}`}>
              Call {h.display}
            </a>
          </div>
        ))}

        <p className="muted" style={{ marginTop: 14, marginBottom: 0 }}>
          Not in Mumbai, or none of these reaching anyone? Search "animal ambulance helpline
          [your city]" or call your nearest 24-hour veterinary hospital directly.
        </p>
      </div>

      <div className="card">
        <h3>Also log a request in the app</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          This notifies clinic partners on PetHealth Hub, but calling the numbers above is
          faster for a true emergency.
        </p>
        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Pet's name</label>
            <input value={petName} onChange={(e) => setPetName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contact number</label>
            <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Your location / landmark</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Notes (what's wrong, symptoms, etc.)</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-block" disabled={loading}>
            {loading ? "Submitting..." : "Log request in app"}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Your past requests</h3>
        {myRequests.length === 0 && <p className="muted">No requests yet.</p>}
        {myRequests.map((r) => (
          <div className="clinic-item" key={r._id}>
            <div>
              <strong>{r.petName || "Pet"}</strong> — {r.location}
              <div className="muted">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <span className={`status-pill status-${r.status}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ambulance;
