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
import TrainerLayout from './pages/TrainerLayout';
import UserLayout from './pages/UserLayout';
import TrainerCourseDetail from './pages/TrainerCourseDetail';
import CoursePage from './pages/CoursePage';
import CoursePage2 from './pages/CoursePage2';

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
            <Route path="/course/:courseId" element={<CoursePage2 />} />
          </Route>
        </Route>
        
        {/* Trainer protected routes */}
         <Route element={<TrainerLayout />}>
        <Route element={<ProtectedRoute allowedRoles={['Trainer']} />}>
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
          <Route path="/courses" element={<CoursesView />} />
          <Route path="/trainer-dashboard/courses/:courseId" element={<TrainerCourseDetail />} />
        </Route>
        </Route>
        
        {/* User protected routes */}
         <Route element={<UserLayout />}>
        <Route element={<ProtectedRoute allowedRoles={['User']} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
        </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;