import { getTokenData } from '../utils/auth';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const tokenData = getTokenData();

  if (tokenData?.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {tokenData.email}!</p>
    </div>
  );
}