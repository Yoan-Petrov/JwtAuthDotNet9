import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import components
import Login from './components/Login';
import Register from './components/Register'; // Make sure this exists
import UsersManagement from './pages/UsersManagement';
import CourseEnrollment from './pages/CourseEnrollment';
import CoursesView from './pages/CoursesView';
import AdminLayout from './pages/AdminLayout';
import TrainerDashboard from './pages/TrainerDashboard';
import UserDashboard from './pages/UserDashboard'; // Fixed import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Register route */}
        
        {/* Admin routes with layout */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/manage-users" element={<UsersManagement />} />
            <Route path="/manage-enrollments" element={<CourseEnrollment />} />
            <Route path="/courses" element={<CoursesView />} />
          </Route>
        </Route>
        
        {/* Trainer protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['Trainer']} />}>
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        </Route>
        
        {/* User protected routes */}
        <Route element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;