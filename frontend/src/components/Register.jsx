import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import './Register.css'; // Import the CSS file

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      // All registrations are STUDENT role by default
      // Include email for password reset functionality
      const response = await api.post('/api/auth/register', { 
        username, 
        password, 
        role: 'STUDENT',
        email: email 
      });
      if (response.status === 200) {
        // Auto-populate profile for students
        const profileData = { fullName, email, phone, institution };
        // Store in localStorage with a temporary key until user logs in
        localStorage.setItem(`temp_profile_${username}`, JSON.stringify(profileData));
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data || 'Error registering user');
    }
  }, [username, password, fullName, email, phone, institution, navigate]);

  return (
    <div className="register-container">
      <Navbar />
      <div className="register-form-container">
        <div className="register-card">
          <h2 className="register-title">Create Account</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Institution (School/College)"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="register-input"
                required
              />
            </div>
            <button type="submit" className="register-button">
              Register as Student
            </button>
          </form>
          <p className="login-link">
            Already have an account? <Link to="/login" className="login-text">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;