require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Define the path to the recipes.json file
const RECIPES_FILE = path.join(__dirname, 'data', 'recipes.json');

// Helper function to read recipes from file
const readRecipes = () => {
  try {
    const data = fs.readFileSync(RECIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading recipes.json:', error);
    return []; // Return empty array if file doesn't exist or is invalid
  }
};

// Helper function to write recipes to file
const writeRecipes = (recipes) => {
  try {
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing recipes.json:', error);
  }
};

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Guided Cooking Backend API');
});

// Get all recipes (from local file)
app.get('/api/recipes', (req, res) => {
  const recipes = readRecipes();
  res.json(recipes);
});

// Add a new recipe
app.post('/api/recipes', (req, res) => {
  const newRecipe = req.body;
  const recipes = readRecipes();
  newRecipe.id = Date.now().toString(); // Simple ID generation
  recipes.push(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

// Update an existing recipe
app.put('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const updatedRecipe = req.body;
  let recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === id);

  if (index !== -1) {
    recipes[index] = { ...recipes[index], ...updatedRecipe, id: id }; // Ensure ID remains the same
    writeRecipes(recipes);
    res.json(recipes[index]);
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// Delete a recipe
app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  let recipes = readRecipes();
  const initialLength = recipes.length;
  recipes = recipes.filter(r => r.id !== id);

  if (recipes.length < initialLength) {
    writeRecipes(recipes);
    res.status(204).send(); // No content for successful deletion
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
});

// New endpoint to search recipes from Spoonacular API
app.get('/api/search-recipes', async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spoonacular API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Spoonacular API returned ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from Spoonacular API:', error.message);
    res.status(500).json({ message: 'Error fetching recipes from external API', details: error.message });
  }
});

// New endpoint to get detailed recipe information from Spoonacular API
app.get('/api/recipe/:id', async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spoonacular API error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Spoonacular API returned ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching detailed recipe from Spoonacular API:', error.message);
    res.status(500).json({ message: 'Error fetching detailed recipe from external API', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});