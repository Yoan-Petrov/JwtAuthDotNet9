import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import all page components
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import UserDashboard from './pages/UserDashboard';
import Unauthorized from './components/Unauthorized';
import UsersManagement from './pages/UsersManagement';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['Trainer']} />}>
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>

         <Route path="/admin" element={<AdminDashboard />} />
<Route path="/users-management" element={<UsersManagement />} />

        {/* Fallback routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;