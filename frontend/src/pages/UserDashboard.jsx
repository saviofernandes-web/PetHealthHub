import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
  const { auth } = useAuth();
  const firstName = auth?.name?.split(" ")[0];

  return (
    <div>
      <div className="hero-panel">
        <h1>Hi, {firstName} 👋</h1>
        <p>Everything you need for your pet's health, in one place — nearby clinics, live availability, and emergency help when it matters.</p>
        <span className="hero-mark">🐾</span>
      </div>

      <div className="emergency-banner">
        <span>🚨 Need urgent help for your pet?</span>
        <Link to="/ambulance">Request an Ambulance →</Link>
      </div>

      <div className="tile-row">
        <Link to="/search" className="tile tile-a">
          <div className="tile-icon">🗺️</div>
          <h3>Nearby Clinics & Hospitals</h3>
          <p>Find vet clinics and hospitals near you, with live availability and directions</p>
        </Link>

        <Link to="/ambulance" className="tile tile-c">
          <div className="tile-icon">🚑</div>
          <h3>Pet Ambulance</h3>
          <p>Verified emergency helplines, plus request pickup for your pet</p>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
