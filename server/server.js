
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, Recipe } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Guided Cooking Backend API');
});

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recipes', error });
  }
});

// Add a new recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: 'Error creating recipe', error });
  }
});

// Update an existing recipe
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (recipe) {
      await recipe.update(req.body);
      res.json(recipe);
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating recipe', error });
  }
});

// Delete a recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByPk(req.params.id);
    if (recipe) {
      await recipe.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Recipe not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting recipe', error });
  }
});


const fetch = require('node-fetch');
const cache = require('memory-cache');

// Spoonacular API Proxy
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = cache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    }
    res.sendResponse = res.send;
    res.send = (body) => {
      cache.put(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  };
};
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

if (!SPOONACULAR_API_KEY) {
  console.warn('SPOONACULAR_API_KEY is not set. Spoonacular API requests will fail.');
}

app.get('/api/search-recipes', cacheMiddleware(3600), async (req, res) => {
  const { query, cuisine, diet, intolerances } = req.query;
  const url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${query}&cuisine=${cuisine}&diet=${diet}&intolerances=${intolerances}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching from Spoonacular', error });
  }
});

app.get('/api/recipe/:id', cacheMiddleware(3600), async (req, res) => {
  const { id } = req.params;
  const url = `${SPOONACULAR_BASE_URL}/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching from Spoonacular', error });
  }
});

app.get('/api/recipe/:id/nutrition', cacheMiddleware(3600), async (req, res) => {
  const { id } = req.params;
  const url = `${SPOONACULAR_BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${SPOONACULAR_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching from Spoonacular', error });
  }
});

app.get('/api/ingredient-substitutes', cacheMiddleware(3600), async (req, res) => {
  const { ingredientName } = req.query;
  const url = `${SPOONACULAR_BASE_URL}/food/ingredients/substitutes?apiKey=${SPOONACULAR_API_KEY}&ingredientName=${ingredientName}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching from Spoonacular', error });
  }
});

if (require.main === module) {
  sequelize.sync({ force: true }).then(async () => {
    // Check if the Recipe table is empty
    const recipeCount = await Recipe.count();
    if (recipeCount === 0) {
      console.log('Seeding database with initial recipes...');
      const recipesData = require('./data/recipes.json');
      for (const recipe of recipesData) {
        await Recipe.create(recipe);
      }
      console.log('Database seeding complete.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = { app, sequelize };



