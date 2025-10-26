import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css'; // Import the CSS file

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Quiz Platform</Link>
      <div className="navbar-content">
        {user ? (
          <>
            <span className="navbar-welcome">Welcome, {user.username} ({user.role})</span>
            <Link to="/profile" className="navbar-register-btn">Profile</Link>
            <button onClick={handleLogout} className="navbar-logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login-btn">Login</Link>
            <Link to="/register" className="navbar-register-btn">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;