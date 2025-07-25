import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// import { getTokenData } from '../utils/auth';
import axios from 'axios';

export const ProtectedRoute = ({ allowedRoles }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('https://localhost:7199/api/Auth/get-role', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRole(response.data);
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!role) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
  
  return <Outlet />;
};