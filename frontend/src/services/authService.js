import axios from 'axios';

export const detectUserRole = async (token) => {
  try {
    // Test Admin endpoint
    await axios.get('https://localhost:7199/api/Auth/admin-only', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return 'Admin';
  } catch (adminError) {
    try {
      // Test Trainer endpoint
      await axios.get('https://localhost:7199/api/Auth/trainer-only', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return 'Trainer';
    } catch (trainerError) {
      // If neither, assume User
      return 'User';
    }
  }
};