import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WelcomePatient from './pages/WelcomePatient';
import WelcomeAdmin from './pages/WelcomeAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDetails from './pages/PatientDetails';

function App() {
  return (
    <main className="min-h-screen bg-slate-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Routes>
        {/* All Routes MUST be inside this tag */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={
          <ProtectedRoute isPublicOnly={true}>
            <Login />
          </ProtectedRoute>
        } />

        <Route path="/register" element={
          <ProtectedRoute isPublicOnly={true}>
            <Register />
          </ProtectedRoute>
        } />

        <Route path="/welcome-patient" element={
          <ProtectedRoute adminOnly={false}>
            <WelcomePatient />
          </ProtectedRoute>
        } />

        <Route path="/welcome-admin" element={
          <ProtectedRoute adminOnly={true}>
            <WelcomeAdmin />
          </ProtectedRoute>
        } />

        {/* This was likely the route causing the error before */}
        <Route path="/admin/patient/:id" element={
          <ProtectedRoute adminOnly={true}>
            <PatientDetails />
          </ProtectedRoute>
        } />

        {/* Safety catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes> 
    </main>
  );
}

export default App;