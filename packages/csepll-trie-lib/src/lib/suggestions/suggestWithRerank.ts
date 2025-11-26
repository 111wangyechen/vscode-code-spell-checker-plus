// suggestWithRerank.ts
// Minimal wrapper: get candidates from trie or CandidateGenerator, optionally rerank with Damerau.

// Try to import parseDictionaryLegacy if needed in some test flows (not required here).
// import * as SDP from '../SimpleDictionaryParser.js';
import { CandidateGenerator } from './candidateGenerator.js';
import { rerankCandidatesByDamerau } from './damerauRerank.js';

export type SuggestOpts = {
  numSuggestions?: number;
  maxDistance?: number;
  rerank?: 'damerau' | null;
  rerankTopK?: number;
  useLowercase?: boolean;
};

/**
 * suggestWithOptionalRerank:
 * - word: input token
 * - source: either a trie-like object with .suggest(word, opts) or an array of dictionary words
 * - opts: see SuggestOpts
 *
 * Returns: string[] (ordered suggestions)
 */
export function suggestWithOptionalRerank(
  word: string,
  source: unknown,
  opts: SuggestOpts = {}
): string[] {
  const numSuggestions = opts.numSuggestions ?? 10;
  const maxDistance = opts.maxDistance;
  const useLowercase = opts.useLowercase ?? true;

  let candidates: string[] = [];

  // 1) If source looks like a trie with suggest()
  try {
    if (source && typeof source.suggest === 'function') {
      // try to call trie.suggest with common option shape
      const s = source.suggest(word, { numSuggestions, ignoreCase: !useLowercase });
      if (Array.isArray(s)) {
        candidates = s.map((x: unknown) => (typeof x === 'string' ? x : x.word ?? x.wordAdjustedToMatchCase ?? String(x)));
      } else if (s && Array.isArray(s.suggestions)) {
        candidates = s.suggestions.map((x: unknown) => (typeof x === 'string' ? x : x.word ?? String(x)));
      }
    }
  } catch {
    // ignore and fallback to CandidateGenerator
    candidates = [];
  }

  // 2) If no candidates from trie, and source is an array -> build CandidateGenerator
  if ((!candidates || candidates.length === 0) && Array.isArray(source)) {
    const cg = new CandidateGenerator({ maxEdit: opts.maxDistance ?? 2, maxSuggestions: numSuggestions, useLowercase });
    cg.buildFromWordList(source.map((w: any) => (typeof w === 'string' ? { word: w, count: 1 } : w)));
    candidates = cg.lookup(word, maxDistance).map(r => r.term);
    
    // 确保所有字典词都在候选列表中，特别是对于短词和转置词
    const dictWords = source.filter(w => typeof w === 'string');
    const missingDictWords = dictWords.filter(w => !candidates.includes(w));
    if (missingDictWords.length > 0) {
      candidates = [...candidates, ...missingDictWords];
    }
    
    // 去重
    candidates = [...new Set(candidates)];
  }

  // 3) Trim to a reasonable pre-rerank window (to limit cost)
  const preRerank = candidates.slice(0, Math.max(numSuggestions, opts.rerankTopK ?? numSuggestions * 2));

  // 4) Optionally rerank using Damerau
  if (opts.rerank === 'damerau') {
    const topK = opts.rerankTopK ?? numSuggestions;
    return rerankCandidatesByDamerau(word, preRerank, { maxDistance: maxDistance ?? Infinity, topK });
  }

  // 5) Default: return top-N as-is (trim to requested size)
  return preRerank.slice(0, numSuggestions);
}
