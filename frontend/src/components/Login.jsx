import React, { useState, useCallback, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Navbar from './Navbar';
import './Login.css'; // Import the CSS file

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.status === 200) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data || 'Error logging in');
    }
  }, [username, password, setUser, navigate]);

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-form-container">
        <div className="login-card">
          <h2 className="login-title">Login</h2>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
            </div>
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '15px', marginBottom: '10px' }}>
            <Link to="/forgot-password" style={{ color: '#667eea', fontSize: '0.9rem' }}>
              Forgot Password?
            </Link>
          </p>
          <p className="register-link">
            Don't have an account? <Link to="/register" className="register-text">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;