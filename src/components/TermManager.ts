import { Term } from '../models';

// 定义TermManager接口
export interface TermManager {
  initialize(): Promise<void>;
  loadDomainTerms(domain: string): Promise<Term[]>;
  addTerm(term: Term, domains: string[]): Promise<void>;
  removeTerm(termId: string): Promise<void>;
  isTermInDictionary(term: string, domains?: string[]): boolean;
  updateTerms(): Promise<void>;
  getTermConfidence(term: string): number;
}

// 模拟存储层接口，将在下一步实现
interface StorageLayer {
  loadTerms(domain?: string): Promise<Term[]>;
  saveTerm(term: Term): Promise<void>;
  deleteTerm(termId: string): Promise<void>;
}

export class TermManagerImpl implements TermManager {
  private storage: StorageLayer;
  private termsCache: Map<string, Term> = new Map();
  private domainTerms: Map<string, Set<string>> = new Map(); // 领域到术语ID的映射
  private isInitialized: boolean = false;

  constructor(storage: StorageLayer) {
    this.storage = storage;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 加载所有术语到缓存
      const allTerms = await this.storage.loadTerms();
      this.buildCache(allTerms);
      this.isInitialized = true;
      console.log(`TermManager initialized with ${allTerms.length} terms`);
    } catch (error) {
      console.error('Failed to initialize TermManager:', error);
      throw new Error('Failed to initialize TermManager');
    }
  }

  async loadDomainTerms(domain: string): Promise<Term[]> {
    await this.ensureInitialized();
    
    const termIds = this.domainTerms.get(domain) || new Set();
    const terms: Term[] = [];
    
    for (const termId of termIds) {
      const term = this.termsCache.get(termId);
      if (term) {
        terms.push(term);
      }
    }
    
    return terms;
  }

  async addTerm(term: Term, domains: string[]): Promise<void> {
    await this.ensureInitialized();
    
    // 确保术语有ID
    if (!term.id) {
      term.id = this.generateId(term.text);
    }
    
    // 更新术语的领域
    term.domains = domains;
    
    // 保存到存储层
    await this.storage.saveTerm(term);
    
    // 更新缓存
    this.addToCache(term);
    
    console.log(`Added term: ${term.text} to domains: ${domains.join(', ')}`);
  }

  async removeTerm(termId: string): Promise<void> {
    await this.ensureInitialized();
    
    const term = this.termsCache.get(termId);
    if (!term) {
      return; // 术语不存在
    }
    
    // 从存储层删除
    await this.storage.deleteTerm(termId);
    
    // 从缓存中删除
    this.removeFromCache(term);
    
    console.log(`Removed term: ${term.text}`);
  }

  isTermInDictionary(term: string, domains?: string[]): boolean {
    // 简单实现：直接检查术语文本是否在缓存中
    for (const cachedTerm of this.termsCache.values()) {
      if (cachedTerm.text.toLowerCase() === term.toLowerCase()) {
        // 如果指定了领域，则检查术语是否属于至少一个指定领域
        if (domains && domains.length > 0) {
          const hasMatchingDomain = cachedTerm.domains.some(domain => 
            domains.includes(domain)
          );
          if (hasMatchingDomain) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    
    // 检查变体
    for (const cachedTerm of this.termsCache.values()) {
      if (cachedTerm.variations.some(v => v.toLowerCase() === term.toLowerCase())) {
        if (domains && domains.length > 0) {
          const hasMatchingDomain = cachedTerm.domains.some(domain => 
            domains.includes(domain)
          );
          if (hasMatchingDomain) {
            return true;
          }
        } else {
          return true;
        }
      }
    }
    
    return false;
  }

  async updateTerms(): Promise<void> {
    await this.ensureInitialized();
    
    try {
      // 重新加载所有术语
      const allTerms = await this.storage.loadTerms();
      this.clearCache();
      this.buildCache(allTerms);
      console.log(`Updated terms, now have ${allTerms.length} terms`);
    } catch (error) {
      console.error('Failed to update terms:', error);
      throw new Error('Failed to update terms');
    }
  }

  getTermConfidence(term: string): number {
    // 查找术语并返回其置信度
    for (const cachedTerm of this.termsCache.values()) {
      if (cachedTerm.text.toLowerCase() === term.toLowerCase()) {
        return cachedTerm.confidence;
      }
      
      // 检查变体
      if (cachedTerm.variations.some(v => v.toLowerCase() === term.toLowerCase())) {
        return cachedTerm.confidence;
      }
    }
    
    return 0; // 术语不存在
  }

  // 辅助方法
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(text: string): string {
    // 简单的ID生成策略
    return `${text.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }

  private buildCache(terms: Term[]): void {
    this.clearCache();
    
    for (const term of terms) {
      this.addToCache(term);
    }
  }

  private addToCache(term: Term): void {
    if (!term.id) {
      term.id = this.generateId(term.text);
    }
    
    // 添加到术语缓存
    this.termsCache.set(term.id, term);
    
    // 添加到领域映射
    for (const domain of term.domains) {
      if (!this.domainTerms.has(domain)) {
        this.domainTerms.set(domain, new Set());
      }
      this.domainTerms.get(domain)!.add(term.id!);
    }
  }

  private removeFromCache(term: Term): void {
    if (!term.id) {
      return;
    }
    
    // 从领域映射中删除
    for (const domain of term.domains) {
      const termIds = this.domainTerms.get(domain);
      if (termIds) {
        termIds.delete(term.id!);
        
        // 如果领域没有术语了，删除该领域
        if (termIds.size === 0) {
          this.domainTerms.delete(domain);
        }
      }
    }
    
    // 从术语缓存中删除
    this.termsCache.delete(term.id);
  }

  private clearCache(): void {
    this.termsCache.clear();
    this.domainTerms.clear();
  }
}