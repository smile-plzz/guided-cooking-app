import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function RecipeForm({ darkMode }) {
  const { id } = useParams(); // Get recipe ID from URL if in edit mode
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    image: '',
    readyInMinutes: '',
    servings: '',
    extendedIngredients: [],
    analyzedInstructions: [{ steps: [] }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      fetch(`http://localhost:5000/api/recipe/${id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setRecipe({
            title: data.title || '',
            image: data.image || '',
            readyInMinutes: data.readyInMinutes || '',
            servings: data.servings || '',
            extendedIngredients: data.extendedIngredients || [],
            analyzedInstructions: data.analyzedInstructions || [{ steps: [] }],
          });
          setLoading(false);
        })
        .catch(e => {
          console.error('Error fetching recipe for edit:', e);
          setError('Failed to load recipe for editing.');
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.extendedIngredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      extendedIngredients: newIngredients,
    }));
  };

  const addIngredient = () => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      extendedIngredients: [...prevRecipe.extendedIngredients, { name: '', amount: '', unit: '' }],
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.extendedIngredients.filter((_, i) => i !== index);
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      extendedIngredients: newIngredients,
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...recipe.analyzedInstructions[0].steps];
    newSteps[index] = { ...newSteps[index], step: value, number: index + 1 };
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      analyzedInstructions: [{ ...prevRecipe.analyzedInstructions[0], steps: newSteps }],
    }));
  };

  const addStep = () => {
    const currentSteps = recipe.analyzedInstructions[0].steps;
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      analyzedInstructions: [{ ...prevRecipe.analyzedInstructions[0], steps: [...currentSteps, { step: '', number: currentSteps.length + 1 }] }],
    }));
  };

  const removeStep = (index) => {
    const newSteps = recipe.analyzedInstructions[0].steps.filter((_, i) => i !== index);
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      analyzedInstructions: [{ ...prevRecipe.analyzedInstructions[0], steps: newSteps.map((s, i) => ({ ...s, number: i + 1 })) }],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `http://localhost:5000/api/recipes/${id}` : 'http://localhost:5000/api/recipes';

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setLoading(false);
        navigate(isEditMode ? `/recipe/${id}` : `/`); // Navigate to detail page or home after save
      })
      .catch(e => {
        console.error('Error saving recipe:', e);
        setError(`Failed to save recipe: ${e.message}`);
        setLoading(false);
      });
  };

  if (loading) {
    return <div className={`recipe-form-page ${darkMode ? 'dark-mode' : ''}`}>Loading form...</div>;
  }

  if (error) {
    return <div className={`recipe-form-page ${darkMode ? 'dark-mode' : ''}`}><p className="error-message">{error}</p></div>;
  }

  return (
    <div className={`recipe-form-page ${darkMode ? 'dark-mode' : ''}`}>
      <h1>{isEditMode ? 'Edit Recipe' : 'Add New Recipe'}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Recipe Title:</label>
          <input type="text" id="title" name="title" value={recipe.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image URL:</label>
          <input type="text" id="image" name="image" value={recipe.image} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="readyInMinutes">Preparation Time (minutes):</label>
          <input type="number" id="readyInMinutes" name="readyInMinutes" value={recipe.readyInMinutes} onChange={handleChange} min="1" />
        </div>
        <div className="form-group">
          <label htmlFor="servings">Servings:</label>
          <input type="number" id="servings" name="servings" value={recipe.servings} onChange={handleChange} min="1" />
        </div>

        <h2>Ingredients</h2>
        {recipe.extendedIngredients.map((ingredient, index) => (
          <div key={index} className="ingredient-item">
            <input
              type="text"
              placeholder="Name"
              value={ingredient.name || ''}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={ingredient.amount || ''}
              onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
              min="0"
            />
            <input
              type="text"
              placeholder="Unit"
              value={ingredient.unit || ''}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
            />
            <button type="button" onClick={() => removeIngredient(index)} className="remove-button">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="add-button">Add Ingredient</button>

        <h2>Instructions</h2>
        {recipe.analyzedInstructions[0].steps.map((step, index) => (
          <div key={index} className="step-item">
            <textarea
              placeholder={`Step ${index + 1}`}
              value={step.step || ''}
              onChange={(e) => handleStepChange(index, e.target.value)}
              rows="3"
              required
            />
            <button type="button" onClick={() => removeStep(index)} className="remove-button">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addStep} className="add-button">Add Step</button>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Recipe' : 'Create Recipe')}
        </button>
      </form>
    </div>
  );
}

export default RecipeForm;
