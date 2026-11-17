import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import NearbySearch from "./pages/NearbySearch";
import Ambulance from "./pages/Ambulance";
import VetDashboard from "./pages/VetDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const Home = () => {
  const { auth } = useAuth();
  if (auth?.role === "vet") return <Navigate to="/vet-dashboard" replace />;
  if (auth?.role === "admin") return <Navigate to="/admin" replace />;
  if (auth?.role === "user") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <NearbySearch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambulance"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Ambulance />
              </ProtectedRoute>
            }
          />

          <Route
            path="/vet-dashboard"
            element={
              <ProtectedRoute allowedRoles={["vet"]}>
                <VetDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
