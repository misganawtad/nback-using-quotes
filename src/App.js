import React, { useState } from 'react';
import QuoteExplorer from './QuoteExplorer';
import NBackTraining from './NBackTraining';
import AddQuote from './AddQuote';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('quotes');

  return (
    <div className="App">
      <nav className="navigation">
        <button 
          className={`nav-button ${currentView === 'quotes' ? 'active' : ''}`}
          onClick={() => setCurrentView('quotes')}
        >
          Quote Explorer
        </button>
        <button 
          className={`nav-button ${currentView === 'addQuote' ? 'active' : ''}`}
          onClick={() => setCurrentView('addQuote')}
        >
          Add Quote
        </button>
        <button 
          className={`nav-button ${currentView === 'nback' ? 'active' : ''}`}
          onClick={() => setCurrentView('nback')}
        >
          N-Back Training
        </button>
      </nav>

      {currentView === 'quotes' && <QuoteExplorer />}
      {currentView === 'addQuote' && <AddQuote />}
      {currentView === 'nback' && <NBackTraining />}
    </div>
  );
}

export default App;