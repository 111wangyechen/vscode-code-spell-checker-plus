import { describe, expect,test } from 'vitest';

import { editDistance } from './distance.js';

describe('editDistance basic', () => {
  test('identical -> 0', () => {
    expect(editDistance('hello', 'hello')).toBe(0);
  });

  test('substitution/insertion/deletion', () => {
    expect(editDistance('kitten', 'sitten')).toBeGreaterThanOrEqual(1);
    expect(editDistance('abc', 'abxc')).toBeGreaterThanOrEqual(1);
    expect(editDistance('abcd', 'acd')).toBeGreaterThanOrEqual(1);
  });

  test('bounded behavior', () => {
    // 若实现按你的示例：当 editCost===Infinity 时，只有完全相等返回 0，否则 Infinity
    expect(editDistance('a', 'b', Infinity)).toBe(Infinity);
  });
});
