import { describe, expect, it } from 'vitest';
import {
  extractDurations,
  formatDuration,
  humanizeMinutes,
} from '../lib/timers.js';

describe('extractDurations', () => {
  it('finds a plain minute duration', () => {
    expect(extractDurations('Simmer for 20 minutes.')).toEqual([
      { seconds: 1200, label: '20 minutes' },
    ]);
  });

  it('takes the upper bound of a range', () => {
    const [first] = extractDurations('Bake for 10-12 minutes until golden.');
    expect(first.seconds).toBe(720);
  });

  it('handles hours and seconds', () => {
    expect(extractDurations('Rest for 1 hour.')[0].seconds).toBe(3600);
    expect(extractDurations('Blanch for 30 seconds.')[0].seconds).toBe(30);
  });

  it('reads Bengali numerals and units', () => {
    const [first] = extractDurations('৩০ মিনিটের জন্য জলে ভিজিয়ে রাখুন।');
    expect(first.seconds).toBe(1800);
  });

  it('ignores text with no duration', () => {
    expect(extractDurations('Slice the garlic thinly.')).toEqual([]);
  });

  it('returns the longest duration first', () => {
    const found = extractDurations('Fry for 2 minutes, then bake 25 minutes.');
    expect(found[0].seconds).toBe(1500);
  });
});

describe('formatting', () => {
  it('formats a countdown', () => {
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(-5)).toBe('0:00');
  });

  it('humanises minutes', () => {
    expect(humanizeMinutes(45)).toBe('45 min');
    expect(humanizeMinutes(90)).toBe('1 hr 30 min');
    expect(humanizeMinutes(120)).toBe('2 hr');
  });
});
