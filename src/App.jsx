import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Indent from './pages/admin/Indent';
import LoadingPoint from './pages/admin/LoadingPoint';
import LoadingComplete from './pages/admin/LoadingComplete';
import StatePass from './pages/admin/GatePass';
import Settings from './pages/admin/Settings';
import AdminLayout from './layouts/AdminLayout';
import NotFound from './pages/NotFound';

function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />
          ) : (
            <Login />
          )
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="indent" element={<Indent />} />
        <Route path="loading-point" element={<LoadingPoint />} />
        <Route path="loading-complete" element={<LoadingComplete />} />
        <Route path="state-pass" element={<StatePass />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Root route - Redirect based on auth status */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard') : '/login'} 
            replace 
          />
        } 
      />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Authentication guard component
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If role is specified and doesn't match, redirect to appropriate dashboard
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  
  // If authenticated and role matches (or no role required), render children
  return children;
}

export default App;