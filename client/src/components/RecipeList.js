import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

// Define animation variants (these would typically be in a separate motion.js file)
const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    ease: 'linear',
    repeat: Infinity,
  },
};

const cardHover = {
  hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  tap: { scale: 0.98 },
};

const chipRemove = {
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

async function fetchRecipes({ queryKey }) {
  const [, searchQuery, cuisine, diet, intolerances] = queryKey;
  let url;
  let params = {};

  if (searchQuery) {
    url = new URL('http://localhost:5000/api/search-recipes');
    params.query = searchQuery;
  } else {
    url = new URL('http://localhost:5000/api/recipes');
  }

  if (cuisine) params.cuisine = cuisine;
  if (diet) params.diet = diet;
  if (intolerances) params.intolerances = intolerances;

  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data;
}

async function fetchFavoriteRecipes() {
  const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
  if (favorites.length === 0) {
    return [];
  }

  const response = await fetch('http://localhost:5000/api/recipes/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: favorites }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

function RecipeList({ darkMode, toggleDarkMode, favoritesOnly }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const navigate = useNavigate();

  const { data: recipesData, error: recipesError, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', searchQuery, cuisine, diet, intolerances],
    queryFn: fetchRecipes,
    enabled: !favoritesOnly,
  });

  const recipes = searchQuery ? recipesData?.results : recipesData;

  const filteredRecipes = recipes;

  const { data: favoriteRecipesData, error: favoritesError, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: fetchFavoriteRecipes,
    enabled: favoritesOnly,
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRecipeClick = (id, source) => {
    navigate(`/recipe/${id}?source=${source}`);
  };

  const recipesToDisplay = favoritesOnly ? favoriteRecipesData : filteredRecipes;
  const isLoading = favoritesOnly ? favoritesLoading : recipesLoading;
  const error = favoritesOnly ? favoritesError : recipesError;

  return (
    <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        cuisine={cuisine}
        setCuisine={setCuisine}
        diet={diet}
        setDiet={setDiet}
        intolerances={intolerances}
        setIntolerances={setIntolerances}
      />
      <main className="container mx-auto p-6 pt-24">
        <AnimatePresence>
          <div className="flex flex-wrap gap-2 mb-4">
            {searchQuery && (
              <motion.div
                className="flex items-center bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-300 font-caption"
                initial={{ opacity: 1, scale: 1 }}
                exit="exit"
                variants={chipRemove}
              >
                Search: {searchQuery}
                <motion.button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Remove search filter: ${searchQuery}`}
                >&times;</motion.button>
              </motion.div>
            )}
            {cuisine && (
              <motion.div
                className="flex items-center bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-300 font-caption"
                initial={{ opacity: 1, scale: 1 }}
                exit="exit"
                variants={chipRemove}
              >
                Cuisine: {cuisine}
                <motion.button
                  onClick={() => setCuisine('')}
                  className="ml-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Remove cuisine filter: ${cuisine}`}
                >&times;</motion.button>
              </motion.div>
            )}
            {diet && (
              <motion.div
                className="flex items-center bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-300 font-caption"
                initial={{ opacity: 1, scale: 1 }}
                exit="exit"
                variants={chipRemove}
              >
                Diet: {diet}
                <motion.button
                  onClick={() => setDiet('')}
                  className="ml-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Remove diet filter: ${diet}`}
                >&times;</motion.button>
              </motion.div>
            )}
            {intolerances && (
              <motion.div
                className="flex items-center bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-300 font-caption"
                initial={{ opacity: 1, scale: 1 }}
                exit="exit"
                variants={chipRemove}
              >
                Intolerances: {intolerances}
                <motion.button
                  onClick={() => setIntolerances('')}
                  className="ml-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Remove intolerances filter: ${intolerances}`}
                >&times;</motion.button>
              </motion.div>
            )}
          </div>
        </AnimatePresence>
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, index) => (
              <div key={index} className="bg-secondary/70 dark:bg-gray-700/70 rounded-lg shadow-md overflow-hidden">
                <motion.div
                  className="w-full h-48 bg-gray-300/70 dark:bg-gray-600/70"
                  variants={shimmer}
                  animate="animate"
                  transition="transition"
                ></motion.div>
                <div className="p-4">
                  <motion.div
                    className="h-4 bg-gray-300/70 dark:bg-gray-600/70 rounded w-3/4 mb-2"
                    variants={shimmer}
                    animate="animate"
                    transition="transition"
                  ></motion.div>
                  <motion.div
                    className="h-4 bg-gray-300/70 dark:bg-gray-600/70 rounded w-1/2"
                    variants={shimmer}
                    animate="animate"
                    transition="transition"
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <p className="text-accent1 text-center mt-6 font-body">{error.message}</p>}
        {!isLoading && recipesToDisplay?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipesToDisplay.map(recipe => (
              <motion.div
                key={recipe.id}
                className="bg-white/70 dark:bg-gray-800/70 rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 ease-in-out backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-accent2 focus:ring-offset-2"
                onClick={() => handleRecipeClick(recipe.id, recipe.source)}
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
              >
                <LazyLoadImage
                  alt={recipe.title || recipe.name}
                  effect="blur"
                  src={recipe.image}
                  className="w-full h-48 object-cover"
                />
                <h2 className="text-h3 font-bold text-text dark:text-gray-100 mt-2 p-4">{recipe.title || recipe.name}</h2>
              </motion.div>
            ))}
          </div>
        ) : (!isLoading && (
          <p className="text-center text-lg text-text-secondary dark:text-gray-300 font-body">{favoritesOnly ? 'No favorite recipes yet.' : 'No recipes found. Try searching for something!'}</p>
        ))}
      </main>
    </div>
  );
}

export default RecipeList;