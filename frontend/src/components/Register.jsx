import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    passwordHash: '',
    firstName: '',  
    lastName: ''    
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       await axios.post(
        'https://localhost:7199/api/Auth/register',
        {
          email: formData.email,
          passwordHash: formData.passwordHash,
          firstName: formData.firstName,  // Must include
          lastName: formData.lastName    // Must include
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      navigate('/login');
    } catch (error) {
      alert(`Registration failed: ${error.response?.data || error.message}`);
      console.error('Registration error:', error.response);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <input
        type="password"
        name="passwordHash"
        value={formData.passwordHash}
        onChange={handleChange}
        placeholder="Password"
        required
      />
      {/* New fields */}
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;