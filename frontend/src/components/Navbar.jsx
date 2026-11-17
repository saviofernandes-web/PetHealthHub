import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src="/logo.png" alt="PetHealth Hub" style={{ height: 32, width: 32, objectFit: "contain", borderRadius: 6 }} />
        PetHealth Hub
      </Link>
      <nav>
        {!auth && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {auth && auth.role === "user" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/search">Nearby Clinics</Link>
            <Link to="/ambulance">Ambulance</Link>
          </>
        )}

        {auth && auth.role === "vet" && <Link to="/vet-dashboard">Clinic Dashboard</Link>}

        {auth && auth.role === "admin" && <Link to="/admin">Admin Panel</Link>}

        {auth && (
          <button className="link" onClick={handleLogout}>
            Logout ({auth.name || auth.clinicName})
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
