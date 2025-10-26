import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 0, hasNext: false, hasPrevious: false });
  const { user } = useContext(AuthContext);

  const fetchQuizzes = async (page = 0) => {
    try {
      const response = await api.get(`/api/quizzes?page=${page}&size=10`);
      // Handle new paginated response structure
      if (response.data.quizzes) {
        setQuizzes(response.data.quizzes);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        });
      } else {
        // Fallback for non-paginated response
        setQuizzes(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      setError('Error fetching quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (loading) return (
    <div className="dashboard-loading">
      <Navbar />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quizzes...</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <h2 className="dashboard-title">Available Quizzes</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="dashboard-actions">
          {user.role === 'ADMIN' && (
            <Link to="/create-quiz" className="create-quiz-btn">
              Create New Quiz
            </Link>
          )}
          <Link to="/results" className="view-results-btn">
            View Results
          </Link>
        </div>
        <div className="quizzes-grid">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <h3 className="quiz-title">{quiz.title}</h3>
              <Link to={`/quiz/${quiz.id}`} className="take-quiz-link">Take Quiz</Link>
            </div>
          ))}
        </div>
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => fetchQuizzes(pagination.currentPage - 1)} 
              disabled={!pagination.hasPrevious}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => fetchQuizzes(pagination.currentPage + 1)} 
              disabled={!pagination.hasNext}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
        {quizzes.length === 0 && !loading && (
          <div className="no-quizzes">
            <p>No quizzes available yet.</p>
            {user.role === 'ADMIN' && (
              <p>Create your first quiz to get started!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;