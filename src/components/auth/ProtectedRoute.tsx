import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { status } = useAuth();
  const location = useLocation();

  // Show loading screen while checking authentication
  if (status === "loading") {
    return <LoadingScreen />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && status === "unauthenticated") {
    // Redirect to auth page, but remember where they were trying to go
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // If authentication is NOT required but user is already authenticated
  // (for pages like /auth where we don't want logged-in users)
  if (!requireAuth && status === "authenticated") {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
