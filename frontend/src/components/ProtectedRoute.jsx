import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any page that needs login. Pass allowedRoles to restrict further,
// e.g. <ProtectedRoute allowedRoles={["vet"]}>...</ProtectedRoute>
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();

  if (!auth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
