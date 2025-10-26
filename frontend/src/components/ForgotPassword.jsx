import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import './Login.css'; // Reuse Login styles

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/api/password-reset/request', { email });
      if (response.status === 200) {
        setMessage(response.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error requesting OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/password-reset/verify', { email, otp });
      if (response.status === 200 && response.data.verified === 'true') {
        setMessage('OTP verified successfully');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/password-reset/reset', {
        email,
        otp,
        newPassword,
      });

      if (response.status === 200) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-form-container">
        <div className="login-card">
          <h2 className="login-title">Forgot Password</h2>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message" style={{ color: 'green' }}>{message}</p>}

          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="login-form">
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="login-input"
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="back-button"
                style={{
                  background: 'transparent',
                  color: '#667eea',
                  border: 'none',
                  marginTop: '10px',
                }}
              >
                Back
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="input-group">
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="login-input"
                  required
                />
              </div>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="back-button"
                style={{
                  background: 'transparent',
                  color: '#667eea',
                  border: 'none',
                  marginTop: '10px',
                }}
              >
                Back
              </button>
            </form>
          )}

          <p className="login-link">
            Remember your password? <Link to="/login" className="login-text">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

