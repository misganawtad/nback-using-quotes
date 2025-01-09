import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle } from 'lucide-react';
import './NBackTraining.css';

const NBackTraining = () => {
  const mentalHealthTags = [
    "Inspirational", "Motivational", "Happiness", 
    "Wisdom", "Change"
  ].sort();

  const [quotes, setQuotes] = useState([]);
  const [displayedQuotes, setDisplayedQuotes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nBackLevel, setNBackLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedTag, setSelectedTag] = useState(mentalHealthTags[0]);
  const [fetchError, setFetchError] = useState(null);

  const fetchQuotes = async (tag) => {
    try {
      setLoading(true);
      setFetchError(null);
      const response = await axios.get(`http://localhost:5000/api/quotes/tags/${tag}`);
      if (response.data.length < 3) {
        setFetchError(`Not enough quotes found for tag "${tag}". Need at least 3 quotes to play.`);
        setQuotes([]);
      } else {
        const shuffledQuotes = response.data.sort(() => Math.random() - 0.5);
        setQuotes(shuffledQuotes);
        setFetchError(null);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setFetchError(`Error fetching quotes for tag "${tag}". Please try another tag.`);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes(selectedTag);
  }, [selectedTag]);

  const handleTagChange = (e) => {
    const newTag = e.target.value;
    setSelectedTag(newTag);
    setGameStarted(false);
    setScore(0);
    setTotalAttempts(0);
    setCurrentIndex(0);
  };

  const generateSequence = () => {
    if (quotes.length < 3) return null;

    const sequence = [];
    const numQuotes = Math.min(quotes.length, 10); // Limit to 10 rounds
    const repeatProbability = 0.3; // 30% chance of repetition

    for (let i = 0; i < numQuotes; i++) {
      if (i >= nBackLevel && Math.random() < repeatProbability) {
        // Add a repeated quote
        sequence.push(sequence[i - nBackLevel]);
      } else {
        // Add a new quote
        let newQuote;
        do {
          newQuote = quotes[Math.floor(Math.random() * quotes.length)];
        } while (
          sequence.slice(Math.max(0, i - nBackLevel)).some(q => q._id === newQuote._id)
        );
        sequence.push(newQuote);
      }
    }
    return sequence;
  };

  const startGame = () => {
    const sequence = generateSequence();
    if (sequence) {
      setDisplayedQuotes(sequence);
      setGameStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setTotalAttempts(0);
      setFeedback(null);
      setFetchError(null);
    }
  };

  const handleAnswer = (isMatch) => {
    if (currentIndex < nBackLevel) {
      setFeedback({
        correct: !isMatch,
        message: isMatch ? 'Incorrect - not enough previous quotes to compare!' : 'Correct!'
      });
      if (!isMatch) setScore(prev => prev + 1);
    } else {
      const actualMatch = displayedQuotes[currentIndex].content === 
                         displayedQuotes[currentIndex - nBackLevel].content;
      const isCorrect = isMatch === actualMatch;
      
      setFeedback({
        correct: isCorrect,
        message: isCorrect ? 'Correct!' : 'Incorrect'
      });

      if (isCorrect) {
        setScore(prev => prev + 1);
      }
    }
    
    setTotalAttempts(prev => prev + 1);

    // Move to next quote
    setTimeout(() => {
      if (currentIndex < displayedQuotes.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFeedback(null);
      } else {
        setGameStarted(false);
      }
    }, 1500);
  };

  const getAccuracy = () => {
    if (totalAttempts === 0) return 0;
    return ((score / totalAttempts) * 100).toFixed(1);
  };

  return (
    <div className="nback-container">
      <div className="nback-header">
        <h2 className="nback-title">N-Back Quote Training</h2>
        
        <div className="controls-section">
          <div className="control-group">
            <div className="select-wrapper">
              <label>Choose Category:</label>
              <select 
                value={selectedTag} 
                onChange={handleTagChange}
                className="select-control"
                disabled={gameStarted}
              >
                {mentalHealthTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="select-wrapper">
              <label>N-Back Level:</label>
              <select 
                value={nBackLevel} 
                onChange={(e) => setNBackLevel(Number(e.target.value))}
                className="select-control"
                disabled={gameStarted}
              >
                <option value={1}>1-Back</option>
                <option value={2}>2-Back</option>
              </select>
            </div>
          </div>

          {loading && <div className="loading-message">Loading quotes...</div>}
          {fetchError && <div className="error-message">{fetchError}</div>}

          {!gameStarted ? (
            <button
              onClick={startGame}
              className="start-button"
              disabled={quotes.length < 3}
            >
              {loading ? 'Loading...' : 'Start Training'}
            </button>
          ) : (
            <div className="score-display">
              Score: {score} / {totalAttempts} ({getAccuracy()}% accuracy)
            </div>
          )}
        </div>
      </div>

      {gameStarted && (
        <div className="quote-card">
          <div className="quote-progress">
            Quote {currentIndex + 1} of {displayedQuotes.length}
          </div>
          <p className="quote-content">{displayedQuotes[currentIndex].content}</p>
          <p className="quote-author">- {displayedQuotes[currentIndex].author}</p>
          
          <div className="action-buttons">
            <button
              onClick={() => handleAnswer(true)}
              className="match-button"
            >
              Match
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="no-match-button"
            >
              No Match
            </button>
          </div>

          {feedback && (
            <div className={`feedback ${feedback.correct ? 'correct' : 'incorrect'}`}>
              {feedback.correct ? 
                <CheckCircle className="feedback-icon" /> : 
                <AlertCircle className="feedback-icon" />
              }
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      )}

      <div className="instructions">
        <h3 className="instructions-title">How to Play:</h3>
        <div className="instructions-text">
          <p>1. Select a mental health-related tag and N-Back level (1 or 2)</p>
          <p>2. For 1-Back: Compare the current quote with the previous quote</p>
          <p>3. For 2-Back: Compare the current quote with the quote shown 2 steps ago</p>
          <p>4. Click "Match" if they're exactly the same, "No Match" if they're different</p>
          <p>5. Try to achieve the highest accuracy possible!</p>
        </div>
      </div>
    </div>
  );
};

export default NBackTraining;