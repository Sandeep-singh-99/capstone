import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { setUser, clearUser, setLoading } from "../redux/auth/authSlice";
import { PatientLayout } from "../components/layout/PatientLayout";
import { LoadingSkeleton } from "../components/common/LoadingSkeleton";
import { useCheckAuth } from "@/api/authApi";

// Lazy-loaded pages
const LandingPage = lazy(() => import("../pages/landing"));
const LoginPage = lazy(() => import("../pages/login"));
const SignupPage = lazy(() => import("../pages/signup"));
const DashboardPage = lazy(() => import("../pages/Dashboard"));
const UploadReportPage = lazy(() => import("../pages/Reports/UploadReport"));
const ReportDetailPage = lazy(() => import("../pages/Reports/ReportDetail"));
const ChatPage = lazy(() => import("../pages/Chat"));
const HistoryPage = lazy(() => import("../pages/History"));
const SpecialistsPage = lazy(() => import("../pages/Specialists"));
const RemindersPage = lazy(() => import("../pages/Reminders"));
const AdminPage = lazy(() => import("../pages/admin"));


// Loading fallback component
function PageLoader() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <LoadingSkeleton type="dashboard" />
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-semibold text-muted-foreground">Verifying secure session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Guest-only Route Guard
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  if (isLoading) {
    return null; // Silent load on public pages
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  const dispatch = useDispatch();
  const { refetch } = useCheckAuth();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: user } = await refetch();
        dispatch(setUser(user));
      } catch (err) {
        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Guest-only auth paths */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />

        {/* Protected Patient Portal Layout */}
        <Route
          element={
            <ProtectedRoute>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports/upload" element={<UploadReportPage />} />
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/specialists" element={<SpecialistsPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
        </Route>

        {/* Admin Portal Page (Self protected inside page if needed) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
