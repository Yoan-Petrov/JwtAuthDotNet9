import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const loginResponse = await axios.post('https://localhost:7199/api/Auth/login', {
        email,
        passwordHash: password
      });

      const accessToken = loginResponse.data.accessToken;
      localStorage.setItem('token', accessToken);
      
      const tokenPayload = parseJwt(accessToken);
      const role = tokenPayload.role || tokenPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      
      switch (role) {
        case 'Admin':
          navigate('/manage-users');
          break;
        case 'Trainer':
          navigate('/trainer-dashboard');
          break;
        case 'User':
          navigate('/user-dashboard');
          break;
        default:
          navigate('/unauthorized');
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.response) {
        errorMessage = error.response.data || error.response.statusText;
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img 
            src="/images/deloitte.png" 
            alt="Deloitte Logo" 
            className="login-logo"
          />
          <h2>Login to your account</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/forgot-password">Forgot your password?</Link>
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;