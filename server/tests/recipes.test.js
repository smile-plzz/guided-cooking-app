const request = require('supertest');
const { app, sequelize, seedDatabase } = require('../server');
const { Recipe } = sequelize.models;

describe('Recipe API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // Recreate tables for tests
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new recipe', async () => {
    const newRecipe = {
      title: 'Test Recipe',
      image: 'http://example.com/image.jpg',
      readyInMinutes: 30,
      servings: 4,
      extendedIngredients: [
        { name: 'Ingredient 1', amount: 100, unit: 'g' },
        { name: 'Ingredient 2', amount: 2, unit: 'cups' },
      ],
      analyzedInstructions: [
        { steps: [{ number: 1, step: 'Step 1 instruction' }, { number: 2, step: 'Step 2 instruction' }] },
      ],
    };
    const res = await request(app).post('/api/recipes').send(newRecipe);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual(newRecipe.title);
    expect(res.body.extendedIngredients).toEqual(newRecipe.extendedIngredients);
    expect(res.body.analyzedInstructions).toEqual(newRecipe.analyzedInstructions);
  });

  it('should get all recipes', async () => {
    const res = await request(app).get('/api/recipes');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should update a recipe', async () => {
    const newRecipe = {
      title: 'Recipe to Update',
      image: 'http://example.com/old_image.jpg',
      readyInMinutes: 15,
      servings: 2,
      extendedIngredients: [
        { name: 'Old Ingredient', amount: 50, unit: 'ml' },
      ],
      analyzedInstructions: [
        { steps: [{ number: 1, step: 'Old instruction' }] },
      ],
    };
    const postRes = await request(app).post('/api/recipes').send(newRecipe);
    const recipeId = postRes.body.id;

    const updatedData = {
      title: 'Updated Recipe Title',
      image: 'http://example.com/new_image.jpg',
      readyInMinutes: 20,
      extendedIngredients: [
        { name: 'New Ingredient', amount: 100, unit: 'g' },
      ],
      analyzedInstructions: [
        { steps: [{ number: 1, step: 'Updated instruction' }] },
      ],
    };
    const putRes = await request(app).put(`/api/recipes/${recipeId}`).send(updatedData);
    expect(putRes.statusCode).toEqual(200);
    expect(putRes.body.title).toEqual(updatedData.title);
    expect(putRes.body.image).toEqual(updatedData.image);
    expect(putRes.body.readyInMinutes).toEqual(updatedData.readyInMinutes);
    expect(putRes.body.extendedIngredients).toEqual(updatedData.extendedIngredients);
    expect(putRes.body.analyzedInstructions).toEqual(updatedData.analyzedInstructions);
  });

  it('should delete a recipe', async () => {
    const newRecipe = {
      title: 'Recipe to Delete',
      ingredients: 'Delete Ingredient',
      instructions: 'Delete Instruction',
    };
    const postRes = await request(app).post('/api/recipes').send(newRecipe);
    const recipeId = postRes.body.id;

    const delRes = await request(app).delete(`/api/recipes/${recipeId}`);
    expect(delRes.statusCode).toEqual(204);

    const getRes = await request(app).get(`/api/recipes/${recipeId}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should fetch favorite recipes by IDs', async () => {
    const recipe1 = await request(app).post('/api/recipes').send({ title: 'Favorite Recipe 1' });
    const recipe2 = await request(app).post('/api/recipes').send({ title: 'Favorite Recipe 2' });

    const favoriteIds = [recipe1.body.id, recipe2.body.id];

    const res = await request(app).post('/api/recipes/favorites').send({ ids: favoriteIds });
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toEqual(2);
    expect(res.body.some(r => r.id === recipe1.body.id)).toBeTruthy();
    expect(res.body.some(r => r.id === recipe2.body.id)).toBeTruthy();
  });

  it('should return 400 if no recipe IDs are provided for favorites', async () => {
    const res = await request(app).post('/api/recipes/favorites').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('No recipe IDs provided.');
  });

  it('should return 500 for invalid recipe creation data', async () => {
    const invalidRecipe = { title: null }; // Invalid data
    const res = await request(app).post('/api/recipes').send(invalidRecipe);
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 404 for updating a non-existent recipe', async () => {
    const updatedData = { title: 'Non Existent' };
    const res = await request(app).put('/api/recipes/99999').send(updatedData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('should return 404 for deleting a non-existent recipe', async () => {
    const res = await request(app).delete('/api/recipes/99999');
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Recipe not found');
  });

  it('should seed the database with initial recipes if empty', async () => {
    await sequelize.sync({ force: true }); // Clear database
    await seedDatabase(); // Call the seeding function directly

    const count = await Recipe.count();
    expect(count).toBeGreaterThan(0);
  });
});
