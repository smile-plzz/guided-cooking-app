import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MealPlannerStyles from './MealPlanner.module.css'; // Reusing some styles
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const fetchApiRecipes = async (searchTerm) => {
  if (!searchTerm) return [];
  const response = await fetch(`http://localhost:5000/api/search-recipes?query=${searchTerm}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.results || [];
};

const RecipeSelectionModal = ({ recipes, onSelectRecipe, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: apiRecipes, isLoading: isLoadingApi, error: apiError } = useQuery({
    queryKey: ['apiSearch', searchTerm],
    queryFn: () => fetchApiRecipes(searchTerm),
    enabled: !!searchTerm, // Only fetch if searchTerm is not empty
  });

  const filteredLocalRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const combinedRecipes = searchTerm ? [...filteredLocalRecipes, ...(apiRecipes || [])] : filteredLocalRecipes;

  return (
    <div className={MealPlannerStyles.modalOverlay}>
      <div className={MealPlannerStyles.modalContent}>
        <button onClick={onClose} className={MealPlannerStyles.modalCloseButton}>&times;</button>
        <h2 className={MealPlannerStyles.modalTitle}>Select a Recipe</h2>
        <input
          type="text"
          placeholder="Search recipes..."
          className={MealPlannerStyles.modalSearchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {isLoadingApi && <p className={MealPlannerStyles.loading}>Searching Spoonacular...</p>}
        {apiError && <p className={MealPlannerStyles.error}>Error searching API: {apiError.message}</p>}
        <div className={MealPlannerStyles.modalRecipeList}>
          {combinedRecipes.length > 0 ? (
            combinedRecipes.map(recipe => (
              <div
                key={recipe.id}
                className={MealPlannerStyles.modalRecipeCard}
                onClick={() => onSelectRecipe(recipe)}
              >
                <LazyLoadImage
                  src={recipe.image}
                  alt={recipe.title}
                  effect="blur"
                  className={MealPlannerStyles.modalRecipeImage}
                />
                <p className={MealPlannerStyles.modalRecipeCardTitle}>{recipe.title}</p>
              </div>
            ))
          ) : (
            <p className={MealPlannerStyles.noResults}>No recipes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeSelectionModal;
