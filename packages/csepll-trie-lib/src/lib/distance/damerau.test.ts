import { describe, expect,test } from 'vitest';

import { damerauLevenshtein } from './damerau.js';

describe('damerauLevenshtein basic', () => {
  test('identical strings -> 0', () => {
    expect(damerauLevenshtein('example', 'example')).toBe(0);
  });

  test('simple substitution', () => {
    // 'kitten' -> 'sitten' cost 1
    expect(damerauLevenshtein('kitten', 'sitten')).toBe(1);
  });

  test('insertion and deletion', () => {
    expect(damerauLevenshtein('abc', 'abxc')).toBe(1); // insertion x
    expect(damerauLevenshtein('abcd', 'acd')).toBe(1); // deletion b
  });

  test('single transposition', () => {
    // transposition of adjacent chars should cost 1
    expect(damerauLevenshtein('ca', 'ac')).toBe(1);
    expect(damerauLevenshtein('abcd', 'abdc')).toBe(1);
  });

  test('respect maxDistance (bounded)', () => {
    // when distance > maxDistance, should return Infinity
    expect(damerauLevenshtein('kitten', 'sitting', 1)).toBe(Infinity);
    // with bigger bound it should compute actual distance
    const d = damerauLevenshtein('kitten', 'sitting', 3);
    expect(d).not.toBe(Infinity);
    expect(d).toBeGreaterThanOrEqual(2);
  });

  test('unicode / diacritics basic', () => {
    // identical with accents
    expect(damerauLevenshtein('café', 'café')).toBe(0);
    // accent removal counts as substitution
    expect(damerauLevenshtein('cafe', 'café')).toBeGreaterThanOrEqual(1);
  });
});
