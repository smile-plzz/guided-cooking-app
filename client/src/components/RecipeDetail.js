import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css'; // Import App.css for general styling
import Timer from './Timer'; // Import the Timer component

function RecipeDetail({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0); // State to track current instruction step
  const [servings, setServings] = useState(1); // State for customizable servings
  const [checkedIngredients, setCheckedIngredients] = useState({}); // State for ingredient checkboxes
  const [showTimer, setShowTimer] = useState(false); // State to control timer visibility
  const [isFavorite, setIsFavorite] = useState(false); // State for favorite status

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/recipe/${id}`);
        if (!response.ok) {
          // Attempt to parse error message from backend if available
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRecipe(data);
        // Initialize servings with the recipe's default servings, or 1 if not available
        setServings(data.servings || 1);

        // Check if recipe is in favorites
        const favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        setIsFavorite(favorites.includes(data.id.toString())); // Ensure ID is string for comparison

      } catch (e) {
        console.error('Error fetching recipe details:', e);
        setError(`Failed to load recipe details: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  const handleNextStep = () => {
    setShowTimer(false); // Hide timer when navigating to next step
    if (recipe.analyzedInstructions[0].steps && currentStep < recipe.analyzedInstructions[0].steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handlePreviousStep = () => {
    setShowTimer(false); // Hide timer when navigating to previous step
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleServingsChange = (e) => {
    const newServings = parseInt(e.target.value, 10);
    if (!isNaN(newServings) && newServings > 0) {
      setServings(newServings);
    } else if (e.target.value === '') {
      setServings(''); // Allow empty input temporarily for user to type
    }
  };

  const handleIngredientCheck = (index) => {
    setCheckedIngredients(prevState => ({
      ...prevState,
      [index]: !prevState[index]
    }));
  };

  const getAdjustedQuantity = (originalQuantity, originalServings) => {
    if (originalServings === 0 || servings === '') return originalQuantity; // Avoid division by zero or empty input
    return (originalQuantity / originalServings * servings).toFixed(2); // Adjust and format to 2 decimal places
  };

  const extractMinutesFromStep = (stepText) => {
    const match = stepText.match(/(\d+)\s*(?:minutes?|min)/i);
    return match ? parseInt(match[1], 10) : 0; // Default to 0 if no time found
  };

  const toggleFavorite = () => {
    let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
    const recipeIdStr = recipe.id.toString();

    if (favorites.includes(recipeIdStr)) {
      favorites = favorites.filter(favId => favId !== recipeIdStr);
      setIsFavorite(false);
    } else {
      favorites.push(recipeIdStr);
      setIsFavorite(true);
    }
    localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
  };

  const handleEditRecipe = () => {
    navigate(`/edit-recipe/${id}`);
  };

  const handleDeleteRecipe = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Remove from favorites if it was a favorite
        let favorites = JSON.parse(localStorage.getItem('favoriteRecipes') || '[]');
        favorites = favorites.filter(favId => favId !== id.toString());
        localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));

        navigate('/'); // Redirect to home page after deletion
      } catch (e) {
        console.error('Error deleting recipe:', e);
        setError(`Failed to delete recipe: ${e.message}`);
      }
    }
  };

  if (loading) {
    return <div className={`recipe-detail-page ${darkMode ? 'dark-mode' : ''}`}>Loading recipe...</div>;
  }

  if (error) {
    return <div className={`recipe-detail-page ${darkMode ? 'dark-mode' : ''}`}><p className="error-message">{error}</p></div>;
  }

  if (!recipe) {
    return <div className={`recipe-detail-page ${darkMode ? 'dark-mode' : ''}`}><p className="error-message">Recipe not found or could not be loaded.</p></div>;
  }

  const totalSteps = recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 
    ? recipe.analyzedInstructions[0].steps.length 
    : 0;

  const currentStepData = totalSteps > 0 
    ? recipe.analyzedInstructions[0].steps[currentStep] 
    : {};
  const currentStepText = currentStepData.step || '';
  const timerMinutes = extractMinutesFromStep(currentStepText);

  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  return (
    <div className={`recipe-detail-page ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className="recipe-title">{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} className="recipe-detail-image" />
      <p className="recipe-meta">Time: {recipe.readyInMinutes} minutes</p>
      <div className="recipe-actions">
        <button onClick={toggleFavorite} className="favorite-button">
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
        <button onClick={handleEditRecipe} className="edit-recipe-button">
          Edit Recipe
        </button>
        <button onClick={handleDeleteRecipe} className="delete-recipe-button">
          Delete Recipe
        </button>
      </div>

      <div className="ingredients-section">
        <h2>Ingredients</h2>
        <div className="servings-input">
          <label htmlFor="servings">Servings:</label>
          <input
            type="number"
            id="servings"
            value={servings}
            onChange={handleServingsChange}
            min="1"
          />
        </div>
        <ul>
          {recipe.extendedIngredients && recipe.extendedIngredients.map((ingredient, index) => (
            <li key={index} className={checkedIngredients[index] ? 'checked' : ''}>
              <input
                type="checkbox"
                id={`ingredient-${index}`}
                checked={checkedIngredients[index] || false}
                onChange={() => handleIngredientCheck(index)}
              />
              <label htmlFor={`ingredient-${index}`}>
                {getAdjustedQuantity(ingredient.amount, recipe.servings)} {ingredient.unit} {ingredient.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="instructions-section">
        <h2>Instructions</h2>
        {totalSteps > 0 ? (
          <>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="progress-text">Step {currentStep + 1} of {totalSteps}</p>
            <div className="instruction-step-container">
              <h3>{currentStepText}</h3>
              <div className="step-visuals">
                {currentStepData.ingredients && currentStepData.ingredients.map((item, idx) => (
                  item.image && (
                    <div key={`ing-${idx}`} className="step-visual-item">
                      <img src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                  )
                ))}
                {currentStepData.equipment && currentStepData.equipment.map((item, idx) => (
                  item.image && (
                    <div key={`eq-${idx}`} className="step-visual-item">
                      <img src={`https://spoonacular.com/cdn/equipment_100x100/${item.image}`} alt={item.name} />
                      <span>{item.name}</span>
                    </div>
                  )
                ))}
              </div>
              {timerMinutes > 0 && (
                <button onClick={() => setShowTimer(!showTimer)} className="toggle-timer-button">
                  {showTimer ? 'Hide Timer' : `Start ${timerMinutes} Min Timer`}
                </button>
              )}
              {showTimer && timerMinutes > 0 && (
                <Timer initialMinutes={timerMinutes} onComplete={() => setShowTimer(false)} />
              )}
              
              <div className="instruction-navigation">
                <button onClick={handlePreviousStep} disabled={currentStep === 0}>Previous</button>
                <button onClick={handleNextStep} disabled={currentStep === totalSteps - 1}>Next</button>
              </div>
            </div>
          </>
        ) : (
          <p>No detailed instructions available.</p>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;
