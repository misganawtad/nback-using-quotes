import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function QuoteExplorer() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('Happiness');
  const tags = [
    "Inspirational", "Motivational", "Happiness", 
    "Wisdom", "Change"
  ].sort();

  const fetchQuotesByTag = async (tag) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/quotes/tags/${tag}`);
      setQuotes(response.data);
    } catch (err) {
      setError('Failed to fetch quotes: ' + err.message);
      console.error('Error details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await axios.delete(`http://localhost:5000/api/quotes/${id}`);
        setQuotes(prevQuotes => prevQuotes.filter(quote => quote._id !== id));
      } catch (err) {
        setError('Failed to delete quote: ' + err.message);
        console.error('Error deleting quote:', err);
      }
    }
  };

  useEffect(() => {
    fetchQuotesByTag(selectedTag);
  }, [selectedTag]);

  const handleTagChange = (event) => {
    setSelectedTag(event.target.value);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Quote Explorer</h1>
        <div className="select-container">
          <select 
            value={selectedTag} 
            onChange={handleTagChange}
            className="tag-select"
          >
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="quotes-container">
        {!loading && !error && Array.isArray(quotes) && (
          quotes.length === 0 ? (
            <div className="no-quotes">No quotes found with tag "{selectedTag}"</div>
          ) : (
            quotes.map(quote => (
              <div key={quote._id} className="quote-card">
                <p className="quote-content">"{quote.content}"</p>
                <p className="quote-author">- {quote.author}</p>
                <div className="quote-tags">
                  {quote.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
                <button 
                  onClick={() => handleDelete(quote._id)}
                  className="delete-button"
                >
                  Delete Quote
                </button>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default QuoteExplorer;