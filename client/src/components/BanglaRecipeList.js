import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const cardHover = {
  hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
  tap: { scale: 0.98 },
};

async function fetchBanglaRecipes() {
  try {
    const response = await fetch('http://localhost:5000/api/bangla-recipes');
    if (!response.ok) {
      throw new Error('Network response from Bangla recipes API was not ok');
    }
    const data = await response.json();
    return data.map(recipe => ({ ...recipe, source: 'bangla' }));
  } catch (error) {
    console.error("Error fetching Bangla recipes:", error);
    return [];
  }
}

function BanglaRecipeList({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate();

  const { data: banglaRecipes, error, isLoading } = useQuery({
    queryKey: ['banglaRecipes'],
    queryFn: fetchBanglaRecipes,
  });

  const handleRecipeClick = (id, source) => {
    navigate(`/recipe/${id}?source=${source}`);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter pt-40 px-4">Loading Bangla Recipes...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter pt-40 px-4">Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter">
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main className="container mx-auto pt-40 px-4">
        <h1 className="text-h1 font-bold text-text dark:text-gray-100 mb-8">Bangla Recipes</h1>
        {banglaRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banglaRecipes.map(recipe => (
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
                  src={recipe.image || '/images/placeholder.jpg'} // Use placeholder if image is missing
                  className="w-full h-48 object-cover"
                />
                <h2 className="text-h3 font-bold text-text dark:text-gray-100 mt-2 p-4 line-clamp-2">{recipe.title || recipe.name}</h2>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg text-text-secondary dark:text-gray-300 font-body">No Bangla recipes found.</p>
        )}
      </main>
    </div>
  );
}

export default BanglaRecipeList;