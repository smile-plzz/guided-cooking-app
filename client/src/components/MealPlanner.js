import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MealPlannerStyles from './MealPlanner.module.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import RecipeSelectionModal from './RecipeSelectionModal';

const fetchRecipes = async () => {
  const response = await fetch('http://localhost:5000/api/recipes');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const MealPlanner = ({ showNotification }) => {
  const { data: recipes, isLoading, error } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const [mealPlan, setMealPlan] = useState(() => {
    const savedMealPlan = localStorage.getItem('mealPlan');
    return savedMealPlan ? JSON.parse(savedMealPlan) : {};
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleClickSlot = (day, mealType) => {
    setSelectedSlot({ day, mealType });
    setShowModal(true);
  };

  const handleSelectRecipe = async (recipe) => {
    if (selectedSlot) {
      let fullRecipeDetails = recipe;
      // If the recipe is from Spoonacular API (doesn't have extendedIngredients initially),
      // fetch full details
      if (!recipe.extendedIngredients && recipe.id) {
        try {
          const response = await fetch(`http://localhost:5000/api/recipe/${recipe.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch full recipe details');
          }
          fullRecipeDetails = await response.json();
        } catch (err) {
          console.error('Error fetching full recipe details:', err);
          // Optionally show a notification to the user
          showNotification('Failed to load full recipe details.', 'error');
          setShowModal(false);
          setSelectedSlot(null);
          return;
        }
      }

      setMealPlan((prevMealPlan) => ({
        ...prevMealPlan,
        [selectedSlot.day]: {
          ...(prevMealPlan[selectedSlot.day] || {}),
          [selectedSlot.mealType]: fullRecipeDetails,
        },
      }));
      setShowModal(false);
      setSelectedSlot(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
  };

  const handleRemoveMeal = (day, mealType) => {
    setMealPlan((prevMealPlan) => {
      const newMealPlan = { ...prevMealPlan };
      if (newMealPlan[day]) {
        delete newMealPlan[day][mealType];
        if (Object.keys(newMealPlan[day]).length === 0) {
          delete newMealPlan[day];
        }
      }
      return newMealPlan;
    });
  };

  const generateShoppingList = () => {
    const shoppingList = {}; // Use an object to store aggregated ingredients

    Object.values(mealPlan).forEach((dayPlan) => {
      Object.values(dayPlan).forEach((recipe) => {
        if (recipe.extendedIngredients) {
          recipe.extendedIngredients.forEach((ingredient) => {
            const name = ingredient.nameClean || ingredient.name;
            const amount = ingredient.amount;
            const unit = ingredient.unit;

            if (name) { // Ensure ingredient has a name
              const key = `${name}-${unit}`; // Use name and unit as key for aggregation
              if (shoppingList[key]) {
                shoppingList[key].amount += amount;
              } else {
                shoppingList[key] = { name, amount, unit };
              }
            }
          });
        }
      });
    });

    // Format for display
    let formattedList = '';
    for (const key in shoppingList) {
      const item = shoppingList[key];
      formattedList += `- ${item.amount} ${item.unit} ${item.name}\n`;
    }

    alert(`Generated Shopping List (check console for details):
${formattedList}`);
    console.log('Generated Shopping List:', shoppingList);
  };

  if (isLoading) return <div className={MealPlannerStyles.loading}>Loading recipes...</div>;
  if (error) return <div className={MealPlannerStyles.error}>Error: {error.message}</div>;

  return (
    <div className={`${MealPlannerStyles.mealPlannerContainer} pt-40`}>
      <h1 className={MealPlannerStyles.title}>Meal Planner</h1>
      <button onClick={generateShoppingList} className={MealPlannerStyles.generateListButton}>
        Generate Shopping List
      </button>
      <div className={MealPlannerStyles.plannerGrid}>
        <div className={MealPlannerStyles.gridHeader}>
          <div></div> {/* Empty corner for alignment */}
          {mealTypes.map((type) => (
            <div key={type} className={MealPlannerStyles.mealTypeHeader}>
              {type}
            </div>
          ))}
        </div>
        {daysOfWeek.map((day) => (
          <div key={day} className={MealPlannerStyles.dayRow}>
            <div className={MealPlannerStyles.dayHeader}>{day}</div>
            {mealTypes.map((mealType) => (
              <div
                key={mealType}
                className={MealPlannerStyles.mealSlot}
                onClick={() => handleClickSlot(day, mealType)}
              >
                {mealPlan[day] && mealPlan[day][mealType] ? (
                  <div className={MealPlannerStyles.plannedMeal}>
                    <Link to={`/recipe/${mealPlan[day][mealType].id}`}>
                      <LazyLoadImage
                        src={mealPlan[day][mealType].image}
                        alt={mealPlan[day][mealType].title}
                        effect="blur"
                        className={MealPlannerStyles.mealImage}
                      />
                      <p className={MealPlannerStyles.mealTitle}>{mealPlan[day][mealType].title}</p>
                    </Link>
                    <button
                      onClick={() => handleRemoveMeal(day, mealType)}
                      className={MealPlannerStyles.removeButton}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <p className={MealPlannerStyles.placeholder}>Click to add recipe</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {showModal && (
        <RecipeSelectionModal
          recipes={recipes}
          onSelectRecipe={handleSelectRecipe}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MealPlanner;
