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

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      
      {/* LOGIN */}
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} /> : <Login />}
      />

      {/* ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="indent" element={<Indent />} />
        <Route path="loading-point" element={<LoadingPoint />} />
        <Route path="loading-complete" element={<LoadingComplete />} />
        <Route path="state-pass" element={<StatePass />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* USER ROUTES */}
      <Route path="/user" element={<AdminLayout />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>

      {/* ROOT */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} />
            : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}

export default App;
