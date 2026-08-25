import { describe, expect, it } from 'vitest';
import { findSubstitutes } from '../lib/substitutions.js';

describe('findSubstitutes', () => {
  it('finds an exact match', () => {
    expect(findSubstitutes('buttermilk').length).toBeGreaterThan(0);
  });

  it('matches an ingredient described in a longer phrase', () => {
    expect(findSubstitutes('2 cloves fresh garlic').length).toBeGreaterThan(0);
  });

  it('prefers the most specific table entry', () => {
    // "mustard oil" must not fall through to the "mustard seeds" entry.
    const [first] = findSubstitutes('mustard oil');
    expect(first.toLowerCase()).toContain('oil');
  });

  it('covers Bengali ingredient names', () => {
    expect(findSubstitutes('সর্ষের তেল').length).toBeGreaterThan(0);
  });

  it('returns nothing for an unknown ingredient', () => {
    expect(findSubstitutes('unobtainium')).toEqual([]);
  });
});
