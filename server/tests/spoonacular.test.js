const request = require('supertest');
const { app } = require('../server');
const fetch = require('node-fetch');

const cache = require('memory-cache');

jest.mock('node-fetch');

describe('Spoonacular API Proxy', () => {
  beforeEach(() => {
    cache.clear();
  });
  it('should fetch recipes from Spoonacular', async () => {
    const mockResponse = { results: [{ id: 1, title: 'Pasta' }] };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

    const res = await request(app).get('/api/search-recipes?query=pasta&cuisine=italian');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('results');
    expect(res.body.results[0].title).toEqual('Pasta');
  });

  it('should fetch recipe details from Spoonacular', async () => {
    const mockResponse = { id: 1, title: 'Pasta' };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

    const res = await request(app).get('/api/recipe/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', 1);
  });

  it('should fetch nutrition details from Spoonacular', async () => {
    const mockResponse = { calories: '500' };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

    const res = await request(app).get('/api/recipe/1/nutrition');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('calories');
  });

  it('should fetch ingredient substitutes from Spoonacular', async () => {
    const mockResponse = { substitutes: ['margarine'] };
    fetch.mockResolvedValue({ json: () => Promise.resolve(mockResponse) });

    const res = await request(app).get('/api/ingredient-substitutes?ingredientName=butter');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('substitutes');
  });
});
