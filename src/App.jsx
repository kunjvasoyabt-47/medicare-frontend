import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDetails from "./pages/PatientDetails";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminDischargeHistory from "./pages/admin/AdminDischargeHistory";
import AdminDischargeDetails from "./pages/admin/AdminDischargeDetails";

// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientDischargeHistory from "./pages/patient/PatientDischargeHistory";
import PatientDischargeDetails from "./pages/patient/PatientDischargeDetails";
import PatientProfile from "./pages/patient/PatientProfile";

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute isPublicOnly>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute isPublicOnly>
              <Register />
            </ProtectedRoute>
          }
        />

        {/* Legacy redirects */}
        <Route
          path="/welcome-admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />
        <Route
          path="/welcome-patient"
          element={<Navigate to="/patient/dashboard" replace />}
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <ProtectedRoute adminOnly>
              <AdminPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/discharge-history"
          element={
            <ProtectedRoute adminOnly>
              <AdminDischargeHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/discharge/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminDischargeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/patient/:id"
          element={
            <ProtectedRoute adminOnly>
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* Patient routes */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute adminOnly={false}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/discharge-history"
          element={
            <ProtectedRoute adminOnly={false}>
              <PatientDischargeHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/discharge/:id"
          element={
            <ProtectedRoute adminOnly={false}>
              <PatientDischargeDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <ProtectedRoute adminOnly={false}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  );
}

export default App;
