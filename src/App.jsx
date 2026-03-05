import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import WelcomePatient from './pages/WelcomePatient';
import WelcomeAdmin from './pages/WelcomeAdmin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Patient Routes */}
        <Route 
          path="/welcome-patient" 
          element={
            <ProtectedRoute>
              <WelcomePatient />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/welcome-admin" 
          element={
            <ProtectedRoute adminOnly={true}>
              <WelcomeAdmin />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* 404 Catch-all */}
        <Route path="*" element={<div className="p-10 text-center font-bold">404 - Page Not Found</div>} />
      </Routes>
    </main>
  );
}

export default App;