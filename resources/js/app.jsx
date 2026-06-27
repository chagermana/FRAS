import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicDashboard from './pages/PublicDashboard';
import HealthcareWorkerDashboard from './pages/HealthcareWorkerDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import HospitalAdminDashboard from './pages/HospitalAdminDashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function DashboardRouter() {
  const { user } = useAuth();
  if (user?.role === 'healthcare_worker') return <HealthcareWorkerDashboard />;
  if (user?.role === 'system_admin') return <SystemAdminDashboard />;
  if (user?.role === 'hospital_admin') return <HospitalAdminDashboard />;
  return <div className="p-8">Unknown role: {user?.role}</div>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardRouter /></ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('app')).render(<App />);
