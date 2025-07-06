import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Timer from './Timer';

const fetchRecipeDetails = async ({ queryKey }) => {
  const [, id] = queryKey;
  const response = await fetch(`http://localhost:5000/api/recipe/${id}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const fetchNutritionDetails = async ({ queryKey }) => {
  const [, id] = queryKey;
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

  const { data: recipe, error, isLoading } = useQuery({
    queryKey: ['recipe', id],
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
    queryKey: ['nutrition', id],
    queryFn: fetchNutritionDetails,
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
    navigate(`/edit-recipe/${id}`);
  };

  const handleDeleteRecipe = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddIngredientsToShoppingList = () => {
    const currentShoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
    const newItems = recipe.extendedIngredients.map(ingredient => ({
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
    <div className="container mx-auto p-4">
      <button onClick={() => navigate('/')} className="bg-gray-500 text-white p-2 mb-4">Home</button>
      <button onClick={toggleFavorite} className="bg-yellow-500 text-white p-2 mb-4 ml-2">{isFavorite ? 'Unfavorite' : 'Favorite'}</button>
      <button onClick={handleEditRecipe} className="bg-blue-500 text-white p-2 mb-4 ml-2">Edit</button>
      <button onClick={handleDeleteRecipe} className="bg-red-500 text-white p-2 mb-4 ml-2" disabled={deleteMutation.isLoading}>
        {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
      </button>
      <h1 className="text-3xl font-bold">{recipe.title}</h1>
      <LazyLoadImage
        alt={recipe.title}
        effect="blur"
        src={recipe.image}
        className="w-full h-96 object-cover my-4"
      />
      <p>Time: {recipe.readyInMinutes} minutes</p>

      <div className="my-4">
        <h2 className="text-2xl font-bold">Ingredients</h2>
        <div className="flex items-center my-2">
          <label className="mr-2">Servings:</label>
          <input type="number" value={servings} onChange={handleServingsChange} min="1" className="p-2 border w-20" />
        </div>
        <div className="flex items-center my-2">
          <label className="mr-2">Units:</label>
          <select value={unitSystem} onChange={handleUnitSystemChange} className="p-2 border">
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </div>
        <ul>
          {recipe.extendedIngredients && recipe.extendedIngredients.map((ingredient, index) => (
            <li key={index} className={`flex items-center ${checkedIngredients[index] ? 'line-through' : ''}`}>
              <input
                type="checkbox"
                checked={checkedIngredients[index] || false}
                onChange={() => handleIngredientCheck(index)}
                className="mr-2"
              />
              {getAdjustedQuantity(ingredient.amount, recipe.servings, ingredient.unit, unitSystem)} {ingredient.name}
            </li>
          ))}
        </ul>
        <button onClick={handleAddIngredientsToShoppingList} className="bg-green-500 text-white p-2 mt-2">Add to Shopping List</button>
      </div>

      {nutritionLoading && <p>Loading nutrition...</p>}
      {nutritionError && <p>Error loading nutrition.</p>}
      {nutrition && nutrition.nutrients && (
        <div className="my-4">
          <h2 className="text-2xl font-bold">Nutrition</h2>
          <ul>
            {nutrition.nutrients.map(nutrient => (
              <li key={nutrient.name}>{nutrient.name}: {nutrient.amount}{nutrient.unit}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="my-4">
        <h2 className="text-2xl font-bold">Instructions</h2>
        {totalSteps > 0 ? (
          <div>
            <p>Step {currentStep + 1} of {totalSteps}</p>
            <p>{currentStepText}</p>
            {timerMinutes > 0 && (
              <button onClick={() => setShowTimer(!showTimer)} className="bg-blue-500 text-white p-2 my-2">
                {showTimer ? 'Hide Timer' : `Start ${timerMinutes} Min Timer`}
              </button>
            )}
            {showTimer && timerMinutes > 0 && (
              <Timer initialMinutes={timerMinutes} onComplete={() => setShowTimer(false)} />
            )}
            <div className="flex justify-between mt-2">
              <button onClick={handlePreviousStep} disabled={currentStep === 0} className="bg-gray-500 text-white p-2">Previous</button>
              <button onClick={handleNextStep} disabled={currentStep === totalSteps - 1} className="bg-gray-500 text-white p-2">Next</button>
            </div>
          </div>
        ) : (
          <p>No instructions available.</p>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;