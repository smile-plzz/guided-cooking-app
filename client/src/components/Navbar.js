import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ darkMode, toggleDarkMode, searchQuery, handleSearchChange, showFavorites, toggleShowFavorites, handleAddRecipeClick }) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="App-header">
      <nav className="navbar-container">
        <div className="navbar-left">
          <h1 className="app-title" onClick={handleHomeClick}>Guided Cooking App</h1>
        </div>
        <div className="navbar-center">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={showFavorites} // Disable search when showing favorites
            />
          </div>
        </div>
        <div className="navbar-right">
          <button onClick={toggleShowFavorites} className="toggle-favorites-button">
            {showFavorites ? 'Show All Recipes' : 'Show My Favorites'}
          </button>
          <button onClick={handleAddRecipeClick} className="add-recipe-button">
            Add New Recipe
          </button>
          <button onClick={toggleDarkMode} className="dark-mode-toggle">
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
