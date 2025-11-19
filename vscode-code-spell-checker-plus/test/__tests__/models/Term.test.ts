import { Term } from '../../../src/models';

describe('Term Model', () => {
  it('should create a valid term object', () => {
    const term: Term = {
      text: 'TypeScript',
      variations: ['typescript', 'TS'],
      domains: ['frontend'],
      confidence: 0.9,
      frequency: 100,
      sources: ['codebase', 'documentation'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(term.text).toBe('TypeScript');
    expect(term.variations).toEqual(['typescript', 'TS']);
    expect(term.domains).toEqual(['frontend']);
    expect(term.confidence).toBe(0.9);
    expect(term.frequency).toBe(100);
    expect(term.sources).toEqual(['codebase', 'documentation']);
    expect(term.createdAt).toBeTruthy();
    expect(term.updatedAt).toBeTruthy();
  });

  it('should accept optional properties', () => {
    const term: Term = {
      id: 'typescript-123',
      text: 'TypeScript',
      variations: [],
      domains: ['frontend', 'backend'],
      confidence: 0.85,
      frequency: 50,
      sources: ['GitHub'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contexts: ['in code', 'in comments'],
      tags: ['programming', 'language']
    };

    expect(term.id).toBe('typescript-123');
    expect(term.contexts).toEqual(['in code', 'in comments']);
    expect(term.tags).toEqual(['programming', 'language']);
  });

  it('should handle minimal term with required properties', () => {
    const term: Term = {
      text: 'React',
      variations: [],
      domains: ['frontend'],
      confidence: 1.0,
      frequency: 1,
      sources: ['sample'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(term.id).toBeUndefined();
    expect(term.contexts).toBeUndefined();
    expect(term.tags).toBeUndefined();
  });
});