import { Navigate, createBrowserRouter } from "react-router";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { DashboardPage } from "../pages/DashboardPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { useAuth } from "../features/auth/useAuth";

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-600">Loading...</div>;
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-600">Loading...</div>;
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
]);
