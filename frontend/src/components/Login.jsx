import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Login request
      const loginResponse = await axios.post('https://localhost:7199/api/Auth/login', {
        email,
        passwordHash: password
      });

      // 2. Store token
      localStorage.setItem('token', loginResponse.data.accessToken);

      // 3. Get role from database
      const roleResponse = await axios.get('https://localhost:7199/api/Auth/get-role', {
        headers: {
          Authorization: `Bearer ${loginResponse.data.accessToken}`
        }
      });

      // 4. Redirect based on role
      switch (roleResponse.data) {
        case 'Admin':
          navigate('/admin-dashboard');
          break;
        case 'Trainer':
          navigate('/trainer-dashboard');
          break;
        default:
          navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Login failed: ${error.response?.data || error.message}`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>

      {/* Link to Register */}
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </>
  );
};

export default Login;
