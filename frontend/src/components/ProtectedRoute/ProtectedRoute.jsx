import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, anonymous = false, loggedIn }) {
  const location = useLocation();
  const from = location.state?.from || "/";

  if (anonymous && loggedIn) return <Navigate to={from} replace />;
  if (!anonymous && !loggedIn) return <Navigate to="/signin" state={{ from: location }} replace />;
  return children;
}