import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  // Fake auth role for now
  const userRole = localStorage.getItem("role");

  if (userRole !== role) {
    return <Navigate to="/login" />;
  }

  if (Array.isArray(role)) {
    if (!role.includes(userRole)) {
      return <Navigate to="/login" />;
    }
  } else {
    if (userRole !== role) {
      return <Navigate to="/login" />;
    }
  }

  return children;
}
