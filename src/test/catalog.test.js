import { describe, expect, it } from 'vitest';
import { BUNDLED, matchAgainstPantry, searchBundled } from '../lib/catalog.js';

describe('the bundled catalog', () => {
  it('ships recipes with ingredients and steps', () => {
    expect(BUNDLED.length).toBeGreaterThan(10);
    for (const recipe of BUNDLED) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.title).toBeTruthy();
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
    }
  });

  it('gives every recipe a unique id', () => {
    const ids = new Set(BUNDLED.map((r) => r.id));
    expect(ids.size).toBe(BUNDLED.length);
  });
});

describe('searchBundled', () => {
  it('matches on the romanised title of a Bengali recipe', () => {
    const results = searchBundled('shorshe');
    expect(results.some((r) => r.id === 'bn-1000001')).toBe(true);
  });

  it('matches on an ingredient name', () => {
    expect(searchBundled('spaghetti').length).toBeGreaterThan(0);
  });

  it('filters by cuisine', () => {
    const results = searchBundled('', { cuisine: 'Bengali' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.cuisine === 'Bengali')).toBe(true);
  });

  it('returns everything for an empty query', () => {
    expect(searchBundled('')).toHaveLength(BUNDLED.length);
  });
});

describe('matchAgainstPantry', () => {
  const recipes = [
    {
      id: 'test-1',
      ingredients: [{ name: 'Onion' }, { name: 'Garlic' }, { name: 'Saffron' }],
    },
  ];

  it('ranks by how much the pantry covers', () => {
    const [match] = matchAgainstPantry(recipes, [
      { name: 'onion' },
      { name: 'garlic' },
    ]);
    expect(match.have).toBe(2);
    expect(match.missing).toEqual(['Saffron']);
  });

  it('matches partial names in both directions', () => {
    const [match] = matchAgainstPantry(
      [{ id: 'x', ingredients: [{ name: 'Red onion' }] }],
      [{ name: 'onion' }]
    );
    expect(match.have).toBe(1);
  });

  it('returns nothing for an empty pantry', () => {
    expect(matchAgainstPantry(recipes, [])).toEqual([]);
  });
});
