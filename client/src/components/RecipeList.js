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
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [intolerances, setIntolerances] = useState('');
  const navigate = useNavigate();

  const onSearchSubmit = () => {
    setSubmittedSearchQuery(searchQuery);
  };

  const { data: recipesData, error: recipesError, isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', submittedSearchQuery, cuisine, diet, intolerances],
    queryFn: fetchRecipes,
    enabled: !favoritesOnly,
  });

  const recipes = submittedSearchQuery ? recipesData?.results : recipesData;

  const filteredRecipes = recipes;

  const { data: favoriteRecipesData, error: favoritesError, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favoriteRecipes'],
    queryFn: fetchFavoriteRecipes,
    enabled: favoritesOnly,
  });

  const handleRecipeClick = (id, source) => {
    navigate(`/recipe/${id}?source=${source}`);
  };

  const recipesToDisplay = favoritesOnly ? favoriteRecipesData : filteredRecipes;
  const isLoading = favoritesOnly ? favoritesLoading : recipesLoading;
  const error = favoritesOnly ? favoritesError : recipesError;

  console.log('recipesToDisplay:', recipesToDisplay);
  console.log('isLoading:', isLoading);

  const cuisines = ["Italian", "Mexican", "Chinese", "Indian", "American"];
  const diets = ["Vegetarian", "Vegan", "Gluten-Free", "Keto", "Paleo"];
  const intolerancesOptions = ["Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish", "Soy", "Sulfite", "Tree Nut", "Wheat"];

  return (
    <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main className="container mx-auto p-6 pt-56">
        <section className="text-center py-16 bg-gradient-to-r from-primary to-accent2 text-white rounded-lg shadow-xl mb-8">
          <h1 className="text-h1 font-bold mb-4">Your Culinary Journey Starts Here</h1>
          <p className="text-body mb-6 max-w-2xl mx-auto">
            Discover, create, and manage your favorite recipes with ease. From quick meals to gourmet dishes, Guided Cooking helps you every step of the way.
          </p>
        </section>
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-secondary/70 dark:bg-gray-800/70 rounded-lg shadow-md backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onSearchSubmit();
                }
              }}
              className="p-2 pl-10 rounded-full border border-gray-300 text-base w-full bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-transparent font-inter"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <button
            onClick={onSearchSubmit}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex-shrink-0"
          >
            Search
          </button>
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
            <option value="">All Cuisines</option>
            {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={diet} onChange={(e) => setDiet(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
            <option value="">All Diets</option>
            {diets.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={intolerances} onChange={(e) => setIntolerances(e.target.value)} className="p-2 rounded-full border border-gray-300 text-base bg-white text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 transition-all duration-300 font-inter">
            <option value="">All Intolerances</option>
            {intolerancesOptions.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <AnimatePresence>
          <div className="flex flex-wrap gap-2 mb-4">
            {submittedSearchQuery && (
              <motion.div
                className="flex items-center bg-primary text-white text-sm px-3 py-1 rounded-full shadow-md transition-all duration-300 font-caption"
                initial={{ opacity: 1, scale: 1 }}
                exit="exit"
                variants={chipRemove}
              >
                Search: {submittedSearchQuery}
                <motion.button
                  onClick={() => setSubmittedSearchQuery('')}
                  className="ml-2 cursor-pointer font-bold"
                  whileHover={{ scale: 1.2 }}
                  transition={{ duration: 0.2 }}
                  aria-label={`Remove search filter: ${submittedSearchQuery}`}
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-700 min-h-[280px] max-h-[320px] flex flex-col"
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
                <h2 className="text-h3 font-bold text-text dark:text-gray-100 mt-2 p-4 line-clamp-2">{recipe.title || recipe.name}</h2>
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