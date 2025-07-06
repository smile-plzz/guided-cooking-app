import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const fetchRecipe = async ({ queryKey }) => {
  const [, id] = queryKey;
  const response = await fetch(`http://localhost:5000/api/recipe/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const saveRecipe = async ({ recipe, id }) => {
  const method = id ? 'PUT' : 'POST';
  const url = id ? `http://localhost:5000/api/recipes/${id}` : 'http://localhost:5000/api/recipes';

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(recipe),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

function RecipeForm({ showNotification }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [recipe, setRecipe] = useState({
    title: '',
    image: '',
    readyInMinutes: '',
    servings: '',
    extendedIngredients: [],
    analyzedInstructions: [{ steps: [] }],
  });

  const isEditMode = Boolean(id);

  const { isFetching } = useQuery({
    queryKey: ['recipe', id],
    queryFn: fetchRecipe,
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data) {
        setRecipe(data);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: saveRecipe,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['recipes']);
      queryClient.invalidateQueries(['recipe', id]);
      showNotification(id ? 'Recipe updated successfully!' : 'Recipe created successfully!', 'success');
      navigate(`/recipe/${data.id || id}`);
    },
    onError: (error) => {
      showNotification(`Error: ${error.message}`, 'error');
    },
  });

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
    mutation.mutate({ recipe, id });
  };

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (mutation.error) {
    return <div>Error: {mutation.error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{isEditMode ? 'Edit Recipe' : 'Add New Recipe'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Title:</label>
          <input type="text" name="title" value={recipe.title} onChange={handleChange} required className="w-full p-2 border" />
        </div>
        <div>
          <label className="block">Image URL:</label>
          <input type="text" name="image" value={recipe.image} onChange={handleChange} className="w-full p-2 border" />
        </div>
        <div>
          <label className="block">Ready In Minutes:</label>
          <input type="number" name="readyInMinutes" value={recipe.readyInMinutes} onChange={handleChange} className="w-full p-2 border" />
        </div>
        <div>
          <label className="block">Servings:</label>
          <input type="number" name="servings" value={recipe.servings} onChange={handleChange} className="w-full p-2 border" />
        </div>

        <h2 className="text-2xl font-bold">Ingredients</h2>
        {recipe.extendedIngredients.map((ingredient, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              placeholder="Name"
              value={ingredient.name || ''}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
              required
              className="w-full p-2 border"
            />
            <input
              type="number"
              placeholder="Amount"
              value={ingredient.amount || ''}
              onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
              className="w-full p-2 border"
            />
            <input
              type="text"
              placeholder="Unit"
              value={ingredient.unit || ''}
              onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              className="w-full p-2 border"
            />
            <button type="button" onClick={() => removeIngredient(index)} className="bg-red-500 text-white p-2">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="bg-blue-500 text-white p-2">Add Ingredient</button>

        <h2 className="text-2xl font-bold">Instructions</h2>
        {recipe.analyzedInstructions[0].steps.map((step, index) => (
          <div key={index} className="flex space-x-2">
            <textarea
              placeholder={`Step ${index + 1}`}
              value={step.step || ''}
              onChange={(e) => handleStepChange(index, e.target.value)}
              required
              className="w-full p-2 border"
            />
            <button type="button" onClick={() => removeStep(index)} className="bg-red-500 text-white p-2">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addStep} className="bg-blue-500 text-white p-2">Add Step</button>

        <button type="submit" className="bg-green-500 text-white p-2" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Saving...' : (isEditMode ? 'Update Recipe' : 'Create Recipe')}
        </button>
      </form>
    </div>
  );
}

export default RecipeForm;
