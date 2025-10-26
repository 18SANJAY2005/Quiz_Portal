import React, { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import './CreateQuiz.css'; // Import the CSS file

const CreateQuiz = () => {
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (user.role !== 'ADMIN') {
    navigate('/dashboard');
    return null;
  }

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, { questionText: '', options: ['', '', '', ''], correctOption: 0 }]);
  }, []);

  const updateQuestion = useCallback((index, field, value) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index][field] = value;
      return newQuestions;
    });
  }, []);

  const updateOption = useCallback((qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[qIndex].options[oIndex] = value;
      return newQuestions;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { title, questions };
      const minutes = parseInt(durationMinutes, 10);
      if (!Number.isNaN(minutes) && minutes > 0) {
        payload.durationSeconds = minutes * 60;
      }
      const response = await api.post('/api/quizzes', payload);
      if (response.status === 200) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error creating quiz');
    }
  }, [title, questions, durationMinutes, navigate]);

  return (
    <div className="create-quiz-container">
      <Navbar />
      <div className="create-quiz-form-container">
        <h2 className="create-quiz-title">Create Quiz</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="quiz-form">
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="quiz-title-input"
            required
          />
          <div className="duration-row">
            <label className="duration-label" htmlFor="duration-minutes">Duration (minutes)</label>
            <input
              id="duration-minutes"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 30"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="duration-input"
            />
          </div>
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="question-container">
              <input
                type="text"
                placeholder="Question Text"
                value={question.questionText}
                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                className="question-text-input"
                required
              />
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-container">
                  <input
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    className="option-input"
                    required
                  />
                  <label className="correct-option-label">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={question.correctOption === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                      className="correct-option-radio"
                    />
                    Correct
                  </label>
                </div>
              ))}
            </div>
          ))}
          <div className="button-container">
            <button type="button" onClick={addQuestion} className="add-question-btn">
              Add Question
            </button>
            <button type="submit" className="create-quiz-btn">
              Create Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;