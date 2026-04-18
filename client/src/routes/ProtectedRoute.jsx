import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { roleDefaultPath } from "../utils/roleRedirect";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, user } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  if (!allowedRoles && user?.role) return <Navigate to={roleDefaultPath(user.role)} replace />;
  return children;
};

export default ProtectedRoute;
