import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import './Results.css';

const ResultSummary = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score;

  return (
    <div className="results-container">
      <Navbar />
      <div className="results-content">
        <h2 className="results-title">Quiz Result</h2>
        {typeof score === 'number' ? (
          <div className="result-card" style={{ maxWidth: 520, margin: '0 auto' }}>
            <div className="result-info">
              <p className="result-quiz-id">Quiz ID: {id}</p>
              <div className="result-score-container">
                <span className="result-score-label">Accuracy:</span>
                <span className={`result-score ${getScoreClass(score)}`}>{score}%</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button className="create-quiz-btn" onClick={() => navigate('/results')}>View All Results</button>
              <button className="add-question-btn" style={{ marginLeft: '0.75rem' }} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
          </div>
        ) : (
          <div className="no-results">
            <p>No score available. Returning to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );

  function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }
};

export default ResultSummary;


