import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";

// Public Pages
import LandingPage from "./pages/public/Landing";

// Admin Pages
import AdminLoginPage from "./pages/admin/Login";

// Dashboard Pages
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import CheckIns from "./pages/dashboard/CheckIns";
import Members from "./pages/dashboard/Members";
import DayPasses from "./pages/dashboard/DayPasses";
import Products from "./pages/dashboard/Products";
import Sales from "./pages/dashboard/Sales";

import "./app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component (Admin Only)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Only admins can access dashboard
  if (!isAdmin()) {
    // Clear invalid auth and redirect
    useAuthStore.getState().logout();
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects if admin is already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (isAuthenticated && isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Route - Landing Page Only */}
          <Route path="/" element={<LandingPage />} />

          {/* Admin Login Route */}
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Admin Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="check-ins" element={<CheckIns />} />
            <Route path="members" element={<Members />} />
            <Route path="day-passes" element={<DayPasses />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
          </Route>

          {/* Legacy Redirects */}
          <Route
            path="/login"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route
            path="/dashboard"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/login" replace />}
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
