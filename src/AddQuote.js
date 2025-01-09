import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function AddQuote() {
  const [formData, setFormData] = useState({
    content: '',
    author: '',
    selectedTags: []
  });
  const [message, setMessage] = useState('');

  const tags = [
    "Inspirational", "Motivational", "Happiness", 
    "Wisdom", "Change"
  ].sort();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagChange = (e) => {
    const value = e.target.value;
    if (value && !formData.selectedTags.includes(value)) {
      setFormData(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, value]
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const newQuote = {
        _id: Math.random().toString(36).substr(2, 9),
        content: formData.content,
        author: formData.author,
        tags: formData.selectedTags,
        authorSlug: formData.author.toLowerCase().replace(/\s+/g, '-'),
        length: formData.content.length,
        dateAdded: new Date().toISOString().split('T')[0],
        dateModified: new Date().toISOString().split('T')[0]
      };

      const response = await axios.post('http://localhost:5000/api/quotes', newQuote);
      setMessage('Quote added successfully!');
      setFormData({ content: '', author: '', selectedTags: [] });
    } catch (err) {
      setMessage('Error adding quote: ' + err.message);
    }
  };

  return (
    <div className="add-quote-container">
      <h2 className="header">Add New Quote</h2>
      
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quote Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter the quote text..."
          />
        </div>

        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter author's name"
          />
        </div>

        <div className="form-group">
          <label>Select Tags</label>
          <select
            onChange={handleTagChange}
            value=""
            className="tag-select"
          >
            <option value="">Select a tag...</option>
            {tags.map(tag => (
              !formData.selectedTags.includes(tag) && (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              )
            ))}
          </select>

          <div className="selected-tags">
            {formData.selectedTags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-button">
          Add Quote
        </button>
      </form>
    </div>
  );
}

export default AddQuote;