// In AdminDashboard.jsx
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <button 
        onClick={() => navigate('/users-management')} // Or '/admin/users' if using subfolder
        className="admin-btn"
      >
        Manage Users
      </button>
    </div>
  );
}