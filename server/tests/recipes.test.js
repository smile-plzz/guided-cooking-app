const request = require('supertest');
const { app, sequelize } = require('../server');
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
      ingredients: 'Ingredient 1, Ingredient 2',
      instructions: 'Step 1, Step 2',
    };
    const res = await request(app).post('/api/recipes').send(newRecipe);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toEqual(newRecipe.title);
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
      ingredients: 'Old Ingredient',
      instructions: 'Old Instruction',
    };
    const postRes = await request(app).post('/api/recipes').send(newRecipe);
    const recipeId = postRes.body.id;

    const updatedData = {
      title: 'Updated Recipe Title',
      ingredients: 'New Ingredient',
    };
    const putRes = await request(app).put(`/api/recipes/${recipeId}`).send(updatedData);
    expect(putRes.statusCode).toEqual(200);
    expect(putRes.body.title).toEqual(updatedData.title);
    expect(putRes.body.ingredients).toEqual(updatedData.ingredients);
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
});
