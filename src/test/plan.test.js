import { describe, expect, it } from 'vitest';
import {
  addToPlan,
  dateKey,
  entriesForDays,
  planEntryFrom,
  removeFromPlan,
  startOfWeek,
  weekDays,
} from '../lib/plan.js';

const recipe = {
  id: 'lc-1',
  title: 'Test recipe',
  servings: 2,
  ingredients: [{ name: 'Onion', amount: 1, unit: '' }],
};

describe('week helpers', () => {
  it('starts the week on Monday', () => {
    // 2026-08-25 is a Tuesday.
    const monday = startOfWeek(new Date(2026, 7, 25));
    expect(monday.getDay()).toBe(1);
    expect(dateKey(monday)).toBe('2026-08-24');
  });

  it('builds seven consecutive days', () => {
    const days = weekDays(startOfWeek(new Date(2026, 7, 25)));
    expect(days).toHaveLength(7);
    expect(dateKey(days[6])).toBe('2026-08-30');
  });

  it('keys dates in local time, not UTC', () => {
    expect(dateKey(new Date(2026, 0, 1))).toBe('2026-01-01');
  });
});

describe('plan mutations', () => {
  it('adds and removes an entry', () => {
    const entry = planEntryFrom(recipe, 4);
    const withEntry = addToPlan({}, '2026-08-25', 'dinner', entry);
    expect(withEntry['2026-08-25'].dinner).toHaveLength(1);

    const emptied = removeFromPlan(withEntry, '2026-08-25', 'dinner', entry.key);
    expect(emptied['2026-08-25']).toBeUndefined();
  });

  it('records the planned serving count', () => {
    expect(planEntryFrom(recipe, 6).servings).toBe(6);
    expect(planEntryFrom(recipe, 6).baseServings).toBe(2);
  });

  it('lists entries across a set of days', () => {
    const plan = addToPlan({}, '2026-08-24', 'lunch', planEntryFrom(recipe));
    const days = weekDays(startOfWeek(new Date(2026, 7, 25)));
    const entries = entriesForDays(plan, days);
    expect(entries).toHaveLength(1);
    expect(entries[0].slot).toBe('lunch');
  });
});
