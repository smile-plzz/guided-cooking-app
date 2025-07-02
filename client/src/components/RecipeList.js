import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Import Navbar

function RecipeList({ darkMode, toggleDarkMode }) {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false); 
  const [favoriteRecipesData, setFavoriteRecipesData] = useState([]); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  // Effect to fetch recipes based on search query or initial load
  useEffect(() => {
    const fetchRecipes = async () => {
      if (showFavorites) return; 

      setError(null); 
      try {
        const url = searchQuery 
          ? `http://localhost:5000/api/search-recipes?query=${searchQuery}`
          : `http://localhost:5000/api/recipes`; 
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (searchQuery) {
          setRecipes(data.results || []);
        } else {
          setRecipes(data);
        }

      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('Failed to load recipes. Please try again later.');
      }
    };

    fetchRecipes();
  }, [searchQuery, showFavorites]); 

  // Effect to fetch detailed favorite recipes
  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      if (!showFavorites) return; 

      setError(null); 
      const favoriteIds = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
      const fetchedFavorites = [];

      for (const id of favoriteIds) {
        try {
          const response = await fetch(`http://localhost:5000/api/recipe/${id}`);
          if (response.ok) {
            const data = await response.json();
            fetchedFavorites.push(data);
          } else {
            console.error(`Failed to fetch favorite recipe ${id}:`, response.status, response.statusText);
          }
        } catch (error) {
          console.error(`Error fetching favorite recipe ${id}:`, error);
          setError('Failed to load some favorite recipes.');
        }
      }
      setFavoriteRecipesData(fetchedFavorites);
    };

    fetchFavoriteDetails();

    const handleStorageChange = () => {
      if (showFavorites) {
        fetchFavoriteDetails(); 
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, [showFavorites]); 

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setShowFavorites(false); 
  };

  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  const toggleShowFavorites = () => {
    setShowFavorites(prev => !prev);
    setSearchQuery(''); 
  };

  const handleAddRecipeClick = () => {
    navigate('/add-recipe');
  };

  const recipesToDisplay = showFavorites ? favoriteRecipesData : recipes;

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <Navbar 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        showFavorites={showFavorites}
        toggleShowFavorites={toggleShowFavorites}
        handleAddRecipeClick={handleAddRecipeClick}
      />
      <main>
        {error && <p className="error-message">{error}</p>}
        <div className="recipe-list-container">
          {recipesToDisplay.length > 0 ? (
            recipesToDisplay.map(recipe => (
              <div key={recipe.id} className="recipe-card" onClick={() => handleRecipeClick(recipe.id)}>
                <img src={recipe.image} alt={recipe.title || recipe.name} className="recipe-thumbnail" />
                <h2>{recipe.title || recipe.name}</h2>
              </div>
            ))
          ) : (
            <p>{showFavorites ? 'No favorite recipes yet.' : 'No recipes found. Try searching for something!'}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default RecipeList;