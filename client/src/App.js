import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Notification from './components/Notification';
import Navbar from './components/Navbar';

import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import ShoppingList from './components/ShoppingList';
import Pantry from './components/Pantry';
import MealPlanner from './components/MealPlanner';
import BanglaRecipeList from './components/BanglaRecipeList';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <AnimatePresence>
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={clearNotification}
            />
          )}
        </AnimatePresence>
        <Routes>
          <Route path="/" element={<RecipeList darkMode={darkMode} toggleDarkMode={toggleDarkMode} showNotification={showNotification} />} />
          <Route path="/recipe/:id" element={<RecipeDetail darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/add-recipe" element={<RecipeForm darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/edit-recipe/:id" element={<RecipeForm darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/favorites" element={<RecipeList darkMode={darkMode} toggleDarkMode={toggleDarkMode} showNotification={showNotification} favoritesOnly />} />
          <Route path="/shopping-list" element={<ShoppingList darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/pantry" element={<Pantry darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/meal-planner" element={<MealPlanner darkMode={darkMode} showNotification={showNotification} />} />
          <Route path="/bangla-recipes" element={<BanglaRecipeList darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
