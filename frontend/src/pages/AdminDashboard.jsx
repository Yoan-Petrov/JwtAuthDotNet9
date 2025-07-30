import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import UsersManagement from '../pages/UsersManagement';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Redirect to users-management if at the root /admin path
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      navigate('/users-management');
    }
  }, [navigate]);

  return (
    <div className="admin-layout">
      {/* Navigation Bar */}
      <nav className="admin-navbar">
        <h1 className="admin-logo">Admin Dashboard</h1>
        <div className="admin-nav-links">
          <Link to="/users-management">
          Manage Users
          </Link>

          <Link to="/admin/enrollments" className="nav-link">
            Manage Enrollments
          </Link>
          <Link to="/admin/courses" className="nav-link">
            Courses
          </Link>
        </div>
      </nav>

      {/* Main Content Area - Shows UsersManagement by default */}
      <main className="admin-content">
        <Outlet />
        {window.location.pathname === '/users-management' && <UsersManagement />}
      </main>
    </div>
  );
}