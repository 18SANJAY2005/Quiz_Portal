import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from './Navbar';
import { AuthContext } from '../context/AuthContext';
import './Quiz.css'; // Import the CSS file

const Quiz = () => {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState('');
  const wasFullscreenRef = useRef(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/api/quizzes/${id}`);
        setQuiz(response.data);
        // Default timer: 1 minute per question if no duration provided
        const seconds = (response.data.durationSeconds)
          ? response.data.durationSeconds
          : (response.data.questions?.length || 1) * 60;
        setTimeLeft(seconds);
      } catch (err) {
        setError('Error fetching quiz');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // auto-enter fullscreen on mount
  useEffect(() => {
    // Attempt to enter fullscreen shortly after mount
    const t = setTimeout(() => {
      if (!isFullscreen) {
        enterFullscreen();
      }
    }, 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // webcam requirement
  useEffect(() => {
    let isMounted = true;
    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!isMounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setWebcamActive(true);
        setWebcamError('');
      } catch (err) {
        setWebcamActive(false);
        setWebcamError('Webcam access is required to take this test.');
      }
    };
    enableWebcam();
    return () => {
      isMounted = false;
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const handleAnswer = useCallback((questionIndex, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;
    let calculatedScore = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOption) {
        calculatedScore += 1;
      }
    });
    const finalScore = Math.round((calculatedScore / quiz.questions.length) * 100);
    try {
      await api.post('/api/results/submit', { quizId: id, score: finalScore });
      setScore(finalScore);
      // Turn off webcam as the test is completed
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      // navigate to summary page with score
      navigate(`/result/${id}`, { state: { score: finalScore } });
    } catch (err) {
      setError('Error submitting result');
    }
  }, [quiz, answers, id, navigate]);

  // countdown timer
  useEffect(() => {
    if (timeLeft === null || score !== null) return;
    if (timeLeft <= 0) {
      // auto-submit when time is up
      handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, score, handleSubmit]);

  // fullscreen handlers
  const enterFullscreen = async () => {
    try {
      const elem = containerRef.current || document.documentElement;
      if (elem.requestFullscreen) await elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) await elem.msRequestFullscreen();
      setIsFullscreen(true);
    } catch {}
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      else if (document.msExitFullscreen) await document.msExitFullscreen();
      setIsFullscreen(false);
    } catch {}
  };

  useEffect(() => {
    const onChange = () => {
      const fs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      setIsFullscreen(fs);
      // Detect transitions from fullscreen -> non-fullscreen
      if (wasFullscreenRef.current && !fs) {
        setFullscreenExitCount((c) => c + 1);
      }
      wasFullscreenRef.current = fs;
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    document.addEventListener('msfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      document.removeEventListener('msfullscreenchange', onChange);
    };
  }, []);

  // Close the test on the 3rd fullscreen exit (more than twice)
  useEffect(() => {
    if (fullscreenExitCount >= 3) {
      alert('Suspicious activity detected. The test has been closed.');
      // Clean up webcam stream before navigating
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      navigate('/dashboard');
    }
  }, [fullscreenExitCount, navigate]);

  // track tab visibility to show warning when user switches tabs
  const [tabHidden, setTabHidden] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const wasHiddenRef = useRef(false);
  useEffect(() => {
    const onVisibility = () => {
      const hidden = document.hidden;
      setTabHidden(hidden);
      // Count transitions to hidden (e.g., Alt+Tab)
      if (!wasHiddenRef.current && hidden) {
        setTabSwitchCount((c) => c + 1);
      }
      wasHiddenRef.current = hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Close test on second tab switch (more than 1 time)
  useEffect(() => {
    if (tabSwitchCount >= 2) {
      alert('Suspicious activity detected. The test has been closed.');
      const stream = streamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
      navigate('/dashboard');
    }
  }, [tabSwitchCount, navigate]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null) return '';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="quiz-loading">
      <Navbar />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    </div>
  );
  
  if (!quiz) return (
    <div>
      <Navbar />
      <div className="quiz-not-found">
        <p>Quiz not found</p>
      </div>
    </div>
  );

  return (
    <div className="quiz-container" ref={containerRef}>
      <Navbar />
      <div className="quiz-content">
        <div className="quiz-header">
          <h2 className="quiz-title">{quiz.title}</h2>
          <div className="quiz-controls">
            <div className={`timer ${timeLeft !== null && timeLeft <= 30 ? 'timer-warning' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            {!isFullscreen ? (
              <button className="control-btn" onClick={enterFullscreen} title="Enter fullscreen">Fullscreen</button>
            ) : (
              <button className="control-btn" onClick={exitFullscreen} title="Exit fullscreen">Exit</button>
            )}
          </div>
        </div>
        {error && <p className="error-message">{error}</p>}
        {(!isFullscreen || tabHidden) && (
          <div className="exam-warning-banner">
            <p>{!isFullscreen ? `Please stay in fullscreen during the exam. ${fullscreenExitCount > 0 ? `(Exits detected: ${fullscreenExitCount})` : ''}` : `The tab is not active. Please return to the exam tab. ${tabSwitchCount > 0 ? `(Tab switches: ${tabSwitchCount})` : ''}`}</p>
          </div>
        )}
        <div className="questions-container">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="question-card">
              <p className="question-text">{question.questionText}</p>
              <div className="options-container">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="option-item">
                    <label className="option-label">
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={answers[qIndex] === oIndex}
                        onChange={() => handleAnswer(qIndex, oIndex)}
                        disabled={!webcamActive}
                        className="option-radio"
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!webcamActive && (
          <div className="webcam-required-banner">
            <p>{webcamError || 'Please enable your webcam to proceed.'}</p>
          </div>
        )}
        <div className="webcam-preview-row">
          <video ref={videoRef} className={`webcam-preview ${webcamActive ? '' : 'webcam-inactive'}`} playsInline muted />
        </div>
        <button onClick={handleSubmit} className="submit-quiz-btn" disabled={!webcamActive}>
          Submit Quiz
        </button>
        {score !== null && (
          <div className="score-display">
            <h3>Your score: {score}%</h3>
            <p>{score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;