import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
        {/* Navbar will now be rendered inside RecipeList */}
        <Routes>
          <Route path="/" element={<RecipeList darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/recipe/:id" element={<RecipeDetail darkMode={darkMode} />} />
          <Route path="/add-recipe" element={<RecipeForm darkMode={darkMode} />} />
          <Route path="/edit-recipe/:id" element={<RecipeForm darkMode={darkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
