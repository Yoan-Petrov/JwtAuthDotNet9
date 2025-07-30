import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Reusing the same styles

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    passwordHash: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await axios.post(
        'https://localhost:7199/api/Auth/register',
        {
          email: formData.email,
          passwordHash: formData.passwordHash,
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data || error.message;
      setError(`Registration failed: ${errorMessage}`);
      console.error('Registration error:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <h2>Create your account</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="passwordHash"
              value={formData.passwordHash}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="login-button"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="login-links">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;