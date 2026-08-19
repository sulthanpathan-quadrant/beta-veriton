import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // ⏳ Wait until AuthContext finishes hydrating from localStorage
  if (loading) {
    return null; // or a loader/spinner if you prefer
  }

  // 🔒 Not authenticated → go to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location }}
      />
    );
  }

  // ✅ Authenticated → allow access
  return children;
};

export default ProtectedRoute;
