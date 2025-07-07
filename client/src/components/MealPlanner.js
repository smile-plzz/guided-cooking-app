import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import MealPlannerStyles from './MealPlanner.module.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const fetchRecipes = async () => {
  const response = await fetch('http://localhost:5000/api/recipes');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const MealPlanner = () => {
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

  const handleDragStart = (e, recipe) => {
    e.dataTransfer.setData('recipe', JSON.stringify(recipe));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, day, mealType) => {
    e.preventDefault();
    const recipe = JSON.parse(e.dataTransfer.getData('recipe'));
    setMealPlan((prevMealPlan) => ({
      ...prevMealPlan,
      [day]: {
        ...(prevMealPlan[day] || {}),
        [mealType]: recipe,
      },
    }));
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
    const shoppingList = {};
    Object.values(mealPlan).forEach((dayPlan) => {
      Object.values(dayPlan).forEach((recipe) => {
        if (recipe.extendedIngredients) {
          recipe.extendedIngredients.forEach((ingredient) => {
            const name = ingredient.nameClean || ingredient.name;
            const amount = ingredient.amount;
            const unit = ingredient.unit;

            if (shoppingList[name]) {
              // Simple aggregation for now, can be improved with unit conversion
              shoppingList[name].amount += amount;
            } else {
              shoppingList[name] = { amount, unit };
            }
          });
        }
      });
    });
    alert(`Generated Shopping List (check console for details):
${JSON.stringify(shoppingList, null, 2)}`);
    console.log('Generated Shopping List:', shoppingList);
  };

  if (isLoading) return <div className={MealPlannerStyles.loading}>Loading recipes...</div>;
  if (error) return <div className={MealPlannerStyles.error}>Error: {error.message}</div>;

  return (
    <div className={MealPlannerStyles.mealPlannerContainer}>
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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day, mealType)}
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
                  <p className={MealPlannerStyles.placeholder}>Drag recipe here</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={MealPlannerStyles.recipeListSection}>
        <h2 className={MealPlannerStyles.sectionTitle}>Available Recipes</h2>
        <div className={MealPlannerStyles.recipeList}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={MealPlannerStyles.recipeCard}
              draggable
              onDragStart={(e) => handleDragStart(e, recipe)}
            >
              <LazyLoadImage
                src={recipe.image}
                alt={recipe.title}
                effect="blur"
                className={MealPlannerStyles.recipeImage}
              />
              <p className={MealPlannerStyles.recipeCardTitle}>{recipe.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;
