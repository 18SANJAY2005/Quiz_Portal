import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';

const App = () => {
  return (
    <div>
      <Navbar />
      <section className="home-hero">
        <div className="home-hero-card">
          <h1 className="home-title"><span className="home-gradient">Welcome</span> to the Quiz Platform</h1>
          <p className="home-subtitle">Sharpen your skills, test your knowledge, and track your progress.</p>
          <div className="home-actions">
            <Link to="/dashboard" className="home-cta">Go to Dashboard</Link>
            <Link to="/results" className="home-secondary">View Results</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;