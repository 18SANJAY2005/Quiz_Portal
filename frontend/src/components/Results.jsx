import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import './Results.css'; // Import the CSS file

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 0, hasNext: false, hasPrevious: false });
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [quizTitles, setQuizTitles] = useState({});
  const [quizFilter, setQuizFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const fetchResults = async (page = 0) => {
    try {
      const endpoint = user.role === 'ADMIN' ? '/api/results/all' : '/api/results/my-results';
      const response = await api.get(`${endpoint}?page=${page}&size=10`);
      
      // Handle new paginated response structure
      if (response.data.results) {
        setResults(response.data.results);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          hasNext: response.data.hasNext,
          hasPrevious: response.data.hasPrevious
        });
      } else {
        // Fallback for non-paginated response
        setResults(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      setError('Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [user]);

  // Fetch quiz titles for admin view to display friendly names
  useEffect(() => {
    const loadQuizTitles = async () => {
      if (!results || results.length === 0) return;
      const ids = Array.from(new Set(results.map((r) => r.quizId))).filter(Boolean);
      const missing = ids.filter((id) => !quizTitles[id]);
      if (missing.length === 0) return;
      try {
        const fetched = await Promise.all(
          missing.map(async (id) => {
            try {
              const res = await api.get(`/api/quizzes/${id}`);
              return [id, res.data?.title || id];
            } catch {
              return [id, id];
            }
          })
        );
        const map = { ...quizTitles };
        fetched.forEach(([id, title]) => { map[id] = title; });
        setQuizTitles(map);
      } catch {}
    };
    if (user?.role === 'ADMIN') {
      loadQuizTitles();
    }
  }, [results, user, quizTitles]);

  if (loading) return (
    <div className="results-loading">
      <Navbar />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading results...</p>
      </div>
    </div>
  );

  return (
    <div className="results-container">
      <Navbar />
      <div className="results-content">
        <h2 className="results-title">{user.role === 'ADMIN' ? 'All Results' : 'My Results'}</h2>
        {error && <p className="error-message">{error}</p>}

        {user.role === 'ADMIN' ? (
          <div>
            <div className="results-filter-bar">
              <div className="filter-item">
                <label>Filter by Quiz</label>
                <select className="filter-select" value={quizFilter} onChange={(e) => setQuizFilter(e.target.value)}>
                  <option value="">All Quizzes</option>
                  {Array.from(new Set(results.map(r => r.quizId))).map((qid) => (
                    <option key={qid} value={qid}>{quizTitles[qid] || qid}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>Search User ID</label>
                <input className="filter-input" placeholder="Type user id..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
              </div>
            </div>

            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Quiz</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .filter(r => !quizFilter || r.quizId === quizFilter)
                    .filter(r => !userFilter || r.userId.toLowerCase().includes(userFilter.toLowerCase()))
                    .map((r) => (
                      <tr key={r.id}>
                        <td className="cell-mono">{r.userId}</td>
                        <td>{quizTitles[r.quizId] || r.quizId}</td>
                        <td>
                          <span className={`result-score ${getScoreClass(r.score)}`}>{r.score}%</span>
                        </td>
                      </tr>
                    ))}
                  {results.length === 0 && (
                    <tr>
                      <td colSpan={3} className="no-results">No results found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => fetchResults(pagination.currentPage - 1)} 
                  disabled={!pagination.hasPrevious}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => fetchResults(pagination.currentPage + 1)} 
                  disabled={!pagination.hasNext}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="results-grid">
            {results.length === 0 ? (
              <div className="no-results">
                <p>No results found.</p>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.id} className="result-card">
                  <div className="result-info">
                    <p className="result-quiz-id">Quiz: {quizTitles[result.quizId] || result.quizId}</p>
                    <div className="result-score-container">
                      <span className="result-score-label">Score:</span>
                      <span className={`result-score ${getScoreClass(result.score)}`}>
                        {result.score}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => fetchResults(pagination.currentPage - 1)} 
                  disabled={!pagination.hasPrevious}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </span>
                <button 
                  onClick={() => fetchResults(pagination.currentPage + 1)} 
                  disabled={!pagination.hasNext}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to determine score color class
  function getScoreClass(score) {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  }
};

export default Results;