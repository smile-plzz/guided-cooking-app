import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Timer from './Timer';

const fetchRecipeDetails = async ({ queryKey }) => {
  const [, id, source] = queryKey;
  let url;
  if (source === 'spoonacular') {
    url = `http://localhost:5000/api/recipe/${id}`;
  } else if (source === 'bangla') {
    // For Bangla recipes, we need to fetch all bangla recipes and find the one with the matching ID
    const response = await fetch('http://localhost:5000/api/bangla-recipes');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const banglaRecipes = await response.json();
    const recipe = banglaRecipes.find(r => r.id.toString() === id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    return recipe;
  } else { // Default to local
    url = `http://localhost:5000/api/recipes/${id}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const fetchNutritionDetails = async ({ queryKey }) => {
  const [, id, source] = queryKey;
  if (source !== 'spoonacular') {
    return null; // Nutrition data only available for Spoonacular recipes
  }
  const response = await fetch(`http://localhost:5000/api/recipe/${id}/nutrition`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const deleteRecipe = async (id) => {
  const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

function RecipeDetail({ showNotification }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState(1);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [showTimer, setShowTimer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [unitSystem, setUnitSystem] = useState('metric');

  const queryParams = new URLSearchParams(window.location.search);
  const source = queryParams.get('source') || 'local'; // Default to 'local'

  const { data: recipe, error, isLoading } = useQuery({
    queryKey: ['recipe', id, source],
    queryFn: fetchRecipeDetails,
    onSuccess: (data) => {
      setServings(data.servings || 1);
      const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
      setIsFavorite(favorites.includes(data.id.toString()));
    },
    onError: (err) => {
      showNotification(`Error loading recipe: ${err.message}`, 'error');
    },
  });

  const { data: nutrition, error: nutritionError, isLoading: nutritionLoading } = useQuery({
    queryKey: ['nutrition', id, source],
    queryFn: fetchNutritionDetails,
    enabled: source === 'spoonacular', // Only fetch nutrition for Spoonacular recipes
    onError: (err) => {
      showNotification(`Error loading nutrition data: ${err.message}`, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      queryClient.invalidateQueries(['recipes']);
      let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
      favorites = favorites.filter(favId => favId !== id.toString());
      localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      showNotification('Recipe deleted successfully!', 'success');
      navigate('/');
    },
    onError: (err) => {
      showNotification(`Error deleting recipe: ${err.message}`, 'error');
    },
  });

  

  const handleNextStep = () => {
    setShowTimer(false);
    if (recipe.analyzedInstructions[0].steps && currentStep < recipe.analyzedInstructions[0].steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setShowTimer(false);
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleServingsChange = (e) => {
    const newServings = parseInt(e.target.value, 10);
    if (!isNaN(newServings) && newServings > 0) {
      setServings(newServings);
    }
  };

  const handleIngredientCheck = (index) => {
    setCheckedIngredients(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const getAdjustedQuantity = (originalQuantity, originalServings, unit, targetUnitSystem) => {
    if (originalServings === 0) return originalQuantity;

    let adjustedQuantity = (originalQuantity / originalServings * servings);

    if (targetUnitSystem === 'imperial') {
      if (unit.toLowerCase().includes('g')) {
        adjustedQuantity *= 0.00220462;
        unit = 'lbs';
      } else if (unit.toLowerCase().includes('ml')) {
        adjustedQuantity *= 0.00422675;
        unit = 'cups';
      }
    } else if (targetUnitSystem === 'metric') {
      if (unit.toLowerCase().includes('cup')) {
        adjustedQuantity *= 240;
        unit = 'ml';
      } else if (unit.toLowerCase().includes('lb')) {
        adjustedQuantity *= 453.592;
        unit = 'g';
      }
    }

    return `${adjustedQuantity.toFixed(2)} ${unit}`;
  };

  const extractMinutesFromStep = (stepText) => {
    const match = stepText.match(/(\d+)\s*minutes/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleUnitSystemChange = (e) => {
    setUnitSystem(e.target.value);
  };

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const recipeIdStr = recipe.id.toString();

    if (favorites.includes(recipeIdStr)) {
      favorites = favorites.filter(favId => favId !== recipeIdStr);
      setIsFavorite(false);
      showNotification('Recipe removed from favorites!', 'success');
    } else {
      favorites.push(recipeIdStr);
      setIsFavorite(true);
      showNotification('Recipe added to favorites!', 'success');
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  };

  const handleEditRecipe = () => {
    if (source === 'local') {
      navigate(`/edit-recipe/${id}`);
    } else {
      showNotification('Only local recipes can be edited.', 'info');
    }
  };

  const handleDeleteRecipe = () => {
    if (source === 'local') {
      if (window.confirm('Are you sure you want to delete this recipe?')) {
        deleteMutation.mutate(id);
      }
    } else {
      showNotification('Only local recipes can be deleted.', 'info');
    }
  };

  const handleAddIngredientsToShoppingList = () => {
    const currentShoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    const ingredientsToAdd = recipe.extendedIngredients || recipe.ingredients || [];

    const newItems = ingredientsToAdd.map(ingredient => ({
      name: ingredient.name,
      quantity: getAdjustedQuantity(ingredient.amount, recipe.servings, ingredient.unit, unitSystem),
      unit: unitSystem,
      checked: false,
    }));
    const updatedShoppingList = [...currentShoppingList, ...newItems];
    localStorage.setItem('shoppingList', JSON.stringify(updatedShoppingList));
    showNotification('Ingredients added to shopping list!', 'success');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  const totalSteps = recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0
    ? recipe.analyzedInstructions[0].steps.length
    : 0;

  const currentStepData = totalSteps > 0
    ? recipe.analyzedInstructions[0].steps[currentStep]
    : {};
  const currentStepText = currentStepData.step || '';
  const timerMinutes = extractMinutesFromStep(currentStepText);

  return (
    <div className="min-h-screen bg-background text-text dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-inter pt-64 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            &larr; Back to Recipes
          </button>
          <div className="flex space-x-2">
            <button onClick={toggleFavorite} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
              {isFavorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button onClick={handleEditRecipe} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
              Edit
            </button>
            <button onClick={handleDeleteRecipe} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out" disabled={deleteMutation.isLoading}>
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <h1 className="text-h1 font-bold text-text dark:text-gray-100 mb-4">{recipe.title}</h1>
        <LazyLoadImage
          alt={recipe.title}
          effect="blur"
          src={recipe.image}
          className="w-full h-96 object-cover rounded-lg shadow-md mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-h3 font-bold text-text dark:text-gray-100 mb-2">Overview</h2>
            <p className="text-body text-text-secondary dark:text-gray-300">
              <span className="font-semibold">Time:</span> {recipe.readyInMinutes} minutes
            </p>
            <p className="text-body text-text-secondary dark:text-gray-300">
              <span className="font-semibold">Servings:</span> {recipe.servings}
            </p>
            {recipe.difficulty && (
              <p className="text-body text-text-secondary dark:text-gray-300">
                <span className="font-semibold">Difficulty:</span> {recipe.difficulty}
              </p>
            )}
          </div>

          <div className="bg-secondary/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-h3 font-bold text-text dark:text-gray-100 mb-2">Ingredients</h2>
            <div className="flex items-center mb-4">
              <label htmlFor="servings-input" className="mr-2 text-body text-text dark:text-gray-100">Servings:</label>
              <input
                id="servings-input"
                type="number"
                value={servings}
                onChange={handleServingsChange}
                min="1"
                className="p-2 border w-20 bg-white dark:bg-gray-800 text-text dark:text-gray-100 border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex items-center mb-4">
              <label htmlFor="unit-system-select" className="mr-2 text-body text-text dark:text-gray-100">Units:</label>
              <select
                id="unit-system-select"
                value={unitSystem}
                onChange={handleUnitSystemChange}
                className="p-2 border bg-white dark:bg-gray-800 text-text dark:text-gray-100 border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {recipe.extendedIngredients && recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index} className={`flex items-center text-body text-text dark:text-gray-100 ${checkedIngredients[index] ? 'line-through text-text-secondary dark:text-gray-500' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checkedIngredients[index] || false}
                    onChange={() => handleIngredientCheck(index)}
                    className="mr-2 h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  {getAdjustedQuantity(ingredient.amount, recipe.servings, ingredient.unit, unitSystem)} {ingredient.name}
                </li>
              ))}
            </ul>
            <button onClick={handleAddIngredientsToShoppingList} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out mt-4">
              Add to Shopping List
            </button>
          </div>

          {nutrition && nutrition.nutrients && (
            <div className="bg-secondary/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-h3 font-bold text-text dark:text-gray-100 mb-2">Nutrition</h2>
              <ul className="list-disc pl-5 space-y-2">
                {nutrition.nutrients.map(nutrient => (
                  <li key={nutrient.name} className="text-body text-text-secondary dark:text-gray-300">
                    <span className="font-semibold">{nutrient.name}:</span> {nutrient.amount}{nutrient.unit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-secondary/70 dark:bg-gray-800/70 p-6 rounded-lg shadow-md backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 mb-8">
          <h2 className="text-h3 font-bold text-text dark:text-gray-100 mb-4">Instructions</h2>
          {totalSteps > 0 ? (
            <div>
              <p className="text-body text-text dark:text-gray-100 mb-4">
                <span className="font-semibold">Step {currentStep + 1} of {totalSteps}:</span> {currentStepText}
              </p>
              {timerMinutes > 0 && (
                <div className="flex items-center space-x-4 mb-4">
                  <button onClick={() => setShowTimer(!showTimer)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    {showTimer ? 'Hide Timer' : `Start ${timerMinutes} Min Timer`}
                  </button>
                  {showTimer && (
                    <Timer initialMinutes={timerMinutes} onComplete={() => setShowTimer(false)} />
                  )}
                </div>
              )}
              <div className="flex justify-between mt-4">
                <button onClick={handlePreviousStep} disabled={currentStep === 0} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous Step
                </button>
                <button onClick={handleNextStep} disabled={currentStep === totalSteps - 1} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step
                </button>
              </div>
            </div>
          ) : (
            <p className="text-body text-text-secondary dark:text-gray-300">No instructions available for this recipe.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;