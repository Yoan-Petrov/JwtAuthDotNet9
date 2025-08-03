import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './AdminLayout.css';

export default function AdminLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('trainer-dashboard')) return 'My Courses';
  if (path.includes('trainer-course-detail')) return 'Course Details';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    try {
      // Call the logout endpoint
      const response = await fetch('https://localhost:7199/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show error to user
    }
  };

  return (
    <div className="admin-container">
      {/* White Navigation Bar */}
      <nav className="admin-nav">
        <div className="nav-logo">
          <img src="/images/deloitte.png" alt="Deloitte Logo" />
        </div>

        {/* Centered navigation with green indicator */}
        <div className="nav-links2">
          <NavLink 
            to="/user-dashboard" 
            className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}
          >
            My Courses
          </NavLink>
          
        </div>

        {/* Profile dropdown on right */}
        <div className="profile-dropdown">
          <button 
            className="profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
          >
            <span>Admin User</span>
            <span className="arrow">▼</span>
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item">Profile</button>
              <button 
                className="dropdown-item" 
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Gradient Header Bar */}
      <div className="page-header-gradient">
        <div className="gradient-left">
          <h1>{getPageTitle()}</h1>
        </div>
        <div className="gradient-center"></div>
        <div className="gradient-right"></div>
      </div>

      {/* Main Content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}