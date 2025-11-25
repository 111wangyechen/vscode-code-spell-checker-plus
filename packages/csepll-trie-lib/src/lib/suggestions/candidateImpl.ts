// candidateImpl.ts
// Adapter that exposes a simple synchronous `generateCandidates(word, dict, options)`
// using the CandidateGenerator class you already have in the project.

import { CandidateGenerator, CandidateGeneratorOptions } from './candidateGenerator.js'; // <-- 如果 CandidateGenerator 文件名不同请改为实际文件名

type GenOptions = {
  maxDistance?: number;
  maxSuggestions?: number;
  useLowercase?: boolean;
  // any other options will be ignored for now
};

/**
 * generateCandidates(word, dict, options) -> string[]
 * - word: input token
 * - dict: array of strings OR array of {word,count}
 * - options: { maxDistance?, maxSuggestions?, useLowercase? }
 */
export function generateCandidates(word: string, dict: Array<string | { word: string; count?: number }>, options: GenOptions = {}): string[] {
  // Build CandidateGenerator with options mapped
  const cgOpts: CandidateGeneratorOptions = {
    maxEdit: options.maxDistance ?? 2,
    maxSuggestions: options.maxSuggestions ?? 8,
    useLowercase: options.useLowercase ?? true,
  };

  const cg = new CandidateGenerator(cgOpts);

  // Normalize dict shape: accept string[] or {word,count}[]
  const list = dict.map(d => (typeof d === 'string' ? { word: d, count: 1 } : d));

  // Build index
  cg.buildFromWordList(list as { word: string; count?: number }[]);

  // Lookup (use maxDistance if provided)
  const maxDist = options.maxDistance;
  const results = cg.lookup(word, maxDist);

  // Return array of terms (strings)
  return results.map(r => r.term);
}
