import { TermManager, TermManagerImpl } from '../../../src/components';
import { Term } from '../../../src/models';
import { Storage } from '../../../src/storage';

// Mock Storage implementation
class MockStorage implements Storage {
  private terms: Term[] = [];

  async loadTerms(domain?: string): Promise<Term[]> {
    if (domain) {
      return this.terms.filter(term => term.domains.includes(domain));
    }
    return [...this.terms];
  }

  async saveTerm(term: Term): Promise<void> {
    const existingIndex = this.terms.findIndex(t => t.id === term.id);
    if (existingIndex >= 0) {
      this.terms[existingIndex] = term;
    } else {
      this.terms.push(term);
    }
  }

  async deleteTerm(termId: string): Promise<void> {
    this.terms = this.terms.filter(term => term.id !== termId);
  }

  // Helper method to initialize with test data
  setInitialTerms(terms: Term[]): void {
    this.terms = [...terms];
  }
}

describe('TermManager', () => {
  let termManager: TermManager;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    termManager = new TermManagerImpl(mockStorage);
  });

  describe('initialize', () => {
    it('should initialize with terms from storage', async () => {
      const testTerms: Term[] = [
        {
          id: 'ts-1',
          text: 'TypeScript',
          variations: ['TS'],
          domains: ['frontend'],
          confidence: 0.9,
          frequency: 100,
          sources: ['code'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      mockStorage.setInitialTerms(testTerms);

      await termManager.initialize();

      // Verify initialization by checking if term is in dictionary
      expect(termManager.isTermInDictionary('TypeScript')).toBe(true);
    });
  });

  describe('addTerm', () => {
    beforeEach(async () => {
      await termManager.initialize();
    });

    it('should add a new term to the dictionary', async () => {
      const term: Term = {
        text: 'React',
        variations: ['react'],
        domains: ['frontend'],
        confidence: 0.95,
        frequency: 50,
        sources: ['documentation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await termManager.addTerm(term, ['frontend']);
      
      expect(termManager.isTermInDictionary('React')).toBe(true);
      expect(termManager.getTermConfidence('React')).toBe(0.95);
    });

    it('should add a term to multiple domains', async () => {
      const term: Term = {
        text: 'NodeJS',
        variations: [],
        domains: [], // Will be set by addTerm
        confidence: 0.9,
        frequency: 30,
        sources: ['backend code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await termManager.addTerm(term, ['frontend', 'backend']);
      
      expect(termManager.isTermInDictionary('NodeJS', ['frontend'])).toBe(true);
      expect(termManager.isTermInDictionary('NodeJS', ['backend'])).toBe(true);
    });
  });

  describe('removeTerm', () => {
    beforeEach(async () => {
      await termManager.initialize();
      
      const term: Term = {
        id: 'vue-1',
        text: 'Vue',
        variations: [],
        domains: ['frontend'],
        confidence: 0.8,
        frequency: 20,
        sources: ['framework'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await termManager.addTerm(term, ['frontend']);
    });

    it('should remove a term from the dictionary', async () => {
      expect(termManager.isTermInDictionary('Vue')).toBe(true);
      
      await termManager.removeTerm('vue-1');
      
      expect(termManager.isTermInDictionary('Vue')).toBe(false);
    });
  });

  describe('isTermInDictionary', () => {
    beforeEach(async () => {
      await termManager.initialize();
      
      const term: Term = {
        id: 'angular-1',
        text: 'Angular',
        variations: ['angular', 'ng'],
        domains: ['frontend'],
        confidence: 0.85,
        frequency: 25,
        sources: ['documentation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await termManager.addTerm(term, ['frontend']);
    });

    it('should find a term by exact text', () => {
      expect(termManager.isTermInDictionary('Angular')).toBe(true);
    });

    it('should find a term by variation', () => {
      expect(termManager.isTermInDictionary('ng')).toBe(true);
    });

    it('should return false for non-existent term', () => {
      expect(termManager.isTermInDictionary('NonExistent')).toBe(false);
    });

    it('should respect domain filtering', () => {
      expect(termManager.isTermInDictionary('Angular', ['frontend'])).toBe(true);
      expect(termManager.isTermInDictionary('Angular', ['backend'])).toBe(false);
    });
  });

  describe('getTermConfidence', () => {
    beforeEach(async () => {
      await termManager.initialize();
      
      const term: Term = {
        text: 'Docker',
        variations: [],
        domains: ['devops'],
        confidence: 0.75,
        frequency: 15,
        sources: ['infrastructure'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await termManager.addTerm(term, ['devops']);
    });

    it('should return the correct confidence for a term', () => {
      expect(termManager.getTermConfidence('Docker')).toBe(0.75);
    });

    it('should return 0 for non-existent term', () => {
      expect(termManager.getTermConfidence('Kubernetes')).toBe(0);
    });
  });

  describe('loadDomainTerms', () => {
    beforeEach(async () => {
      await termManager.initialize();
      
      // Add terms to different domains
      await termManager.addTerm({
        text: 'React',
        variations: [],
        domains: ['frontend'],
        confidence: 0.9,
        frequency: 50,
        sources: ['code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, ['frontend']);
      
      await termManager.addTerm({
        text: 'Express',
        variations: [],
        domains: ['backend'],
        confidence: 0.8,
        frequency: 30,
        sources: ['code'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, ['backend']);
    });

    it('should load terms for a specific domain', async () => {
      const frontendTerms = await termManager.loadDomainTerms('frontend');
      expect(frontendTerms.length).toBe(1);
      expect(frontendTerms[0].text).toBe('React');
      
      const backendTerms = await termManager.loadDomainTerms('backend');
      expect(backendTerms.length).toBe(1);
      expect(backendTerms[0].text).toBe('Express');
    });

    it('should return empty array for domain with no terms', async () => {
      const aiTerms = await termManager.loadDomainTerms('ai');
      expect(aiTerms.length).toBe(0);
    });
  });
});