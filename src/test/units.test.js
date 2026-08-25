import { describe, expect, it } from 'vitest';
import {
  aggregateIngredients,
  convert,
  formatAmount,
  scaleIngredient,
  unitFamily,
} from '../lib/units.js';

describe('formatAmount', () => {
  it('prints whole numbers without a fraction', () => {
    expect(formatAmount(3)).toBe('3');
  });

  it('uses fraction glyphs for common amounts', () => {
    expect(formatAmount(0.5)).toBe('½');
    expect(formatAmount(1.5)).toBe('1½');
    expect(formatAmount(0.25)).toBe('¼');
    expect(formatAmount(2 / 3)).toBe('⅔');
  });

  it('falls back to decimals for awkward amounts', () => {
    expect(formatAmount(2.47)).toBe('2.47');
  });

  it('returns an empty string for a missing amount', () => {
    expect(formatAmount(null)).toBe('');
    expect(formatAmount(undefined)).toBe('');
  });
});

describe('unit conversion', () => {
  it('recognises measurement families', () => {
    expect(unitFamily('tbsp')).toBe('volume');
    expect(unitFamily('kg')).toBe('weight');
    expect(unitFamily('clove')).toBe(null);
  });

  it('converts weight between systems', () => {
    expect(convert(1, 'lb', 'metric')).toEqual({ amount: 454, unit: 'g' });
    expect(convert(1000, 'g', 'metric')).toEqual({ amount: 1, unit: 'kg' });
  });

  it('converts volume to the largest sensible unit', () => {
    expect(convert(1, 'cup', 'metric')).toEqual({ amount: 237, unit: 'ml' });
    expect(convert(250, 'ml', 'us').unit).toBe('cup');
  });

  it('leaves unconvertible units alone', () => {
    expect(convert(4, 'টুকরা', 'metric')).toEqual({ amount: 4, unit: 'টুকরা' });
  });
});

describe('scaleIngredient', () => {
  it('scales the amount by the serving factor', () => {
    const scaled = scaleIngredient({ name: 'Flour', amount: 200, unit: 'g' }, 2);
    expect(scaled.scaledAmount).toBe(400);
    expect(scaled.displayAmount).toBe('400');
  });

  it('keeps amountless ingredients readable', () => {
    const scaled = scaleIngredient({ name: 'Salt', amount: null, unit: '' }, 3);
    expect(scaled.displayAmount).toBe('');
    expect(scaled.name).toBe('Salt');
  });
});

describe('aggregateIngredients', () => {
  it('adds together the same ingredient in the same unit', () => {
    const merged = aggregateIngredients([
      { name: 'Onion', nameClean: 'onion', amount: 1, unit: '', from: 'A' },
      { name: 'Onion', nameClean: 'onion', amount: 2, unit: '', from: 'B' },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].amount).toBe(3);
    expect(merged[0].sources).toEqual(['A', 'B']);
  });

  it('combines compatible units into one line', () => {
    const merged = aggregateIngredients([
      { name: 'Butter', nameClean: 'butter', amount: 100, unit: 'g' },
      { name: 'Butter', nameClean: 'butter', amount: 1, unit: 'oz' },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0].unit).toBe('g');
    expect(Math.round(merged[0].amount)).toBe(128);
  });

  it('keeps incompatible units apart rather than adding them wrongly', () => {
    const merged = aggregateIngredients([
      { name: 'Milk', nameClean: 'milk', amount: 200, unit: 'ml' },
      { name: 'Milk', nameClean: 'milk', amount: 2, unit: 'cartons' },
    ]);
    expect(merged).toHaveLength(2);
  });
});
