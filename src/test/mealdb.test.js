import { describe, expect, it } from 'vitest';
import { normalizeMeal, parseMeasure } from '../../api/_lib/mealdb.js';

describe('parseMeasure', () => {
  it('splits an amount from its unit', () => {
    expect(parseMeasure('2 tbs')).toEqual({ amount: 2, unit: 'tbs' });
  });

  it('reads a simple fraction', () => {
    expect(parseMeasure('1/2 cup')).toEqual({ amount: 0.5, unit: 'cup' });
  });

  it('reads a vulgar fraction glyph', () => {
    expect(parseMeasure('½ tsp').amount).toBe(0.5);
  });

  it('leaves an unmeasured ingredient alone', () => {
    expect(parseMeasure('to taste')).toEqual({ amount: null, unit: 'to taste' });
  });

  it('handles an empty measure', () => {
    expect(parseMeasure('')).toEqual({ amount: null, unit: '' });
  });
});

describe('normalizeMeal', () => {
  const meal = {
    idMeal: '52772',
    strMeal: 'Teriyaki Chicken Casserole',
    strCategory: 'Chicken',
    strArea: 'Japanese',
    strMealThumb: 'https://example.test/photo.jpg',
    strTags: 'Meat,Casserole',
    strYoutube: 'https://youtube.test/watch',
    strInstructions:
      'Preheat oven to 350° F.\nCombine soy sauce and water in a saucepan.\nBake for 30 minutes.',
    strIngredient1: 'soy sauce',
    strMeasure1: '3/4 cup',
    strIngredient2: 'water',
    strMeasure2: '1/2 cup',
    strIngredient3: '',
    strMeasure3: '',
  };

  it('maps the flat ingredient columns into a list', () => {
    const recipe = normalizeMeal(meal);
    expect(recipe.ingredients).toHaveLength(2);
    expect(recipe.ingredients[0]).toMatchObject({
      name: 'soy sauce',
      amount: 0.75,
      unit: 'cup',
    });
  });

  it('numbers the steps it splits out of the instructions', () => {
    const recipe = normalizeMeal(meal);
    expect(recipe.steps).toHaveLength(3);
    expect(recipe.steps[0].number).toBe(1);
    expect(recipe.steps[2].text).toContain('30 minutes');
  });

  it('prefixes the id so its origin is unambiguous', () => {
    expect(normalizeMeal(meal).id).toBe('md-52772');
  });

  it('flags its cooking time as an estimate', () => {
    const recipe = normalizeMeal(meal);
    expect(recipe.timeIsEstimate).toBe(true);
    expect(recipe.readyInMinutes).toBeGreaterThan(0);
  });

  it('splits a single-paragraph method into readable steps', () => {
    const recipe = normalizeMeal({
      ...meal,
      strInstructions:
        'Heat the oil in a large pan over a medium heat until shimmering. Add the onions and cook them slowly until deep golden. Stir in the spices and cook for one minute more. Pour in the stock and simmer for twenty minutes.',
    });
    expect(recipe.steps.length).toBeGreaterThan(1);
  });
});
