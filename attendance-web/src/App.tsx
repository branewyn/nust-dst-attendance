import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import ClassesPage from "./pages/ClassesPage.tsx";
import CreateClassPage from "./pages/CreateClassPage.tsx";
import ClassDetailPage from "./pages/ClassDetailPage.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import UsersPage from "./pages/admin/UsersPage.tsx";
import AllClassesPage from "./pages/admin/AllClassesPage.tsx";
import AllAttendancePage from "./pages/admin/AllAttendancePage.tsx";
import PushLogsPage from "./pages/admin/PushLogsPage.tsx";

function RequireAuth({ roles }: { roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Lecturer routes */}
      <Route element={<RequireAuth roles={["LECTURER", "ADMIN"]} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/classes/new" element={<CreateClassPage />} />
        <Route path="/classes/:id" element={<ClassDetailPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<RequireAuth roles={["ADMIN"]} />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="classes" element={<AllClassesPage />} />
        <Route path="attendance" element={<AllAttendancePage />} />
        <Route path="push-logs" element={<PushLogsPage />} />
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
