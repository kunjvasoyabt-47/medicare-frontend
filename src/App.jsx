import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WelcomePatient from './pages/WelcomePatient';
import WelcomeAdmin from './pages/WelcomeAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import PatientDetails from './pages/PatientDetails';

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Routes>
      {/* Public Only: Logged-in users are redirected away */}
      <Route path="/login" element={
          <ProtectedRoute isPublicOnly={true}>
            <Login />
          </ProtectedRoute>
        } 
      />
      <Route path="/register" element={
          <ProtectedRoute isPublicOnly={true}>
            <Register />
          </ProtectedRoute>
        } 
      />

      {/* Private Patient Route */}
      <Route path="/welcome-patient" element={
          <ProtectedRoute adminOnly={false}>
            <WelcomePatient />
          </ProtectedRoute>
        } 
      />

      {/* Private Admin Route */}
      <Route path="/welcome-admin" element={
          <ProtectedRoute adminOnly={true}>
            <WelcomeAdmin />
          </ProtectedRoute>
        } 
      />

    <Route path="/admin/patient/:id" element={
      <ProtectedRoute adminOnly={true}>
        <PatientDetails />
      </ProtectedRoute>
    } 
  />

    </Routes>
    </main>
  );
}

export default App;