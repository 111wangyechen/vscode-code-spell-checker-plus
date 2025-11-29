// packages/cspell-trie-lib/src/perf/rerank.bench.test.ts
import { performance } from 'node:perf_hooks';

import { test } from 'vitest';

import { rerankCandidatesByDamerau } from '../lib/suggestions/damerauRerank.js';

// tiny helper RNG
function randInt(n: number) { return Math.floor(Math.random() * n); }
const alphabet = [...'abcdefghijklmnopqrstuvwxyzé'];

// random word generator
function randWord(min = 1, max = 8) {
  const L = min + randInt(max - min + 1);
  let s = '';
  for (let i = 0; i < L; i++) s += alphabet[randInt(alphabet.length)];
  return s;
}

// produce a candidate list of given size biased to be near the input
function makeCandidates(input: string, size: number) {
  const set = new Set<string>();
  set.add(input);
  while (set.size < size) {
    const choice = Math.random();
    if (choice < 0.6) {
      // mutate input a bit
      const i = randInt(input.length || 1);
      const op = randInt(4);
      if (op === 0 && input.length > 0) { // delete
        set.add(input.slice(0, i) + input.slice(i + 1));
      } else if (op === 1) { // insert
        set.add(input.slice(0, i) + alphabet[randInt(alphabet.length)] + input.slice(i));
      } else if (op === 2 && input.length > 0) { // substitute
        set.add(input.slice(0, i) + alphabet[randInt(alphabet.length)] + input.slice(i + 1));
      } else { // transpose-ish
        if (input.length > 1) {
          const j = Math.min(input.length - 1, i + 1);
          const arr = [...input];
          const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
          set.add(arr.join(''));
        } else {
          set.add(randWord());
        }
      }
    } else {
      set.add(randWord(1, 10));
    }
    if (set.size > 200_000) break; // safety
  }
  return [...set].slice(0, size);
}

function stats(ms: number[]) {
  ms.sort((a, b) => a - b);
  const sum = ms.reduce((s, v) => s + v, 0);
  const mean = sum / ms.length;
  const median = ms[Math.floor(ms.length / 2)];
  const p95 = ms[Math.floor(ms.length * 0.95)] ?? ms[ms.length - 1];
  const min = ms[0], max = ms[ms.length - 1];
  return { mean, median, p95, min, max, n: ms.length };
}

// This is a perf script not a correctness test; set a long timeout if necessary in your environment.
// Run with: pnpm test src/perf/rerank.bench.ts
test.skip('rerank.bench (informational) — run performance benchmark and print timings', () => {
  const input = 'performance';
  const sizes = [10, 50, 100, 500, 1000];
  const trialsPerSize = 50; // reduce if too slow; increase to stabilize numbers
  console.log('rerank bench — sizes:', sizes, 'trialsPerSize:', trialsPerSize);
  for (const size of sizes) {
    const times: number[] = [];
    // reuse candidate pools to avoid measuring candidate generation cost repeatedly
    const pools: string[][] = [];
    for (let t = 0; t < trialsPerSize; t++) pools.push(makeCandidates(input, size));
    for (let t = 0; t < trialsPerSize; t++) {
      const cands = pools[t];
      const t0 = performance.now();
      // topK = size (measure worst-case), you may change topK to smaller value for realistic scenario
      rerankCandidatesByDamerau(input, cands, { maxDistance: 10, topK: size });
      const t1 = performance.now();
      times.push(t1 - t0);
    }
    const s = stats(times);
    console.log(`size=${String(size).padStart(4)} | n=${s.n} | mean=${s.mean.toFixed(3)}ms | median=${s.median.toFixed(3)}ms | p95=${s.p95.toFixed(3)}ms | min=${s.min.toFixed(3)}ms | max=${s.max.toFixed(3)}ms`);
  }
});
