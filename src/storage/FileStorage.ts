import * as fs from 'fs';
import * as path from 'path';
import { Term, MainDictionary, DomainDictionary } from '../models';

// 定义存储层接口
export interface Storage {
  loadTerms(domain?: string): Promise<Term[]>;
  saveTerm(term: Term): Promise<void>;
  deleteTerm(termId: string): Promise<void>;
}

/**
 * 文件存储实现类
 * 负责从文件系统加载和保存术语数据
 */
export class FileStorage implements Storage {
  private basePath: string;
  private mainDictionaryPath: string;

  constructor(basePath: string = './generated') {
    this.basePath = basePath;
    this.mainDictionaryPath = path.join(basePath, 'terms.json');
    
    // 确保目录存在
    this.ensureDirectoryExists();
  }

  async loadTerms(domain?: string): Promise<Term[]> {
    try {
      if (domain) {
        // 加载特定领域的术语
        const domainFilePath = path.join(this.basePath, `terms-${domain}.json`);
        if (fs.existsSync(domainFilePath)) {
          const data = fs.readFileSync(domainFilePath, 'utf8');
          const domainDict: DomainDictionary = JSON.parse(data);
          return domainDict.terms || [];
        }
        return [];
      } else {
        // 加载所有术语
        if (fs.existsSync(this.mainDictionaryPath)) {
          const data = fs.readFileSync(this.mainDictionaryPath, 'utf8');
          const mainDict: MainDictionary = JSON.parse(data);
          return mainDict.terms || [];
        }
        
        // 如果主字典不存在，尝试从领域字典合并
        return this.loadAllDomainTerms();
      }
    } catch (error) {
      console.error('Error loading terms:', error);
      return [];
    }
  }

  async saveTerm(term: Term): Promise<void> {
    try {
      // 首先读取现有数据
      const terms = await this.loadTerms();
      
      // 检查术语是否已存在
      const existingIndex = terms.findIndex(t => t.id === term.id);
      
      if (existingIndex >= 0) {
        // 更新现有术语
        terms[existingIndex] = term;
      } else {
        // 添加新术语
        terms.push(term);
      }
      
      // 保存到主字典
      const mainDict: MainDictionary = {
        metadata: {
          version: '1.0',
          generated_at: new Date().toISOString(),
          source_projects: 1, // 简化处理
          total_terms: terms.length
        },
        terms
      };
      
      fs.writeFileSync(this.mainDictionaryPath, JSON.stringify(mainDict, null, 2));
      
      // 同时更新相关领域的字典
      for (const domain of term.domains) {
        await this.saveToDomainDictionary(term, domain);
      }
      
    } catch (error) {
      console.error('Error saving term:', error);
      throw new Error('Failed to save term');
    }
  }

  async deleteTerm(termId: string): Promise<void> {
    try {
      // 首先加载所有术语
      const terms = await this.loadTerms();
      const termIndex = terms.findIndex(t => t.id === termId);
      
      if (termIndex === -1) {
        return; // 术语不存在
      }
      
      const term = terms[termIndex];
      
      // 从主字典中删除
      terms.splice(termIndex, 1);
      
      // 保存更新后的主字典
      const mainDict: MainDictionary = {
        metadata: {
          version: '1.0',
          generated_at: new Date().toISOString(),
          source_projects: 1,
          total_terms: terms.length
        },
        terms
      };
      
      fs.writeFileSync(this.mainDictionaryPath, JSON.stringify(mainDict, null, 2));
      
      // 从相关领域的字典中删除
      for (const domain of term.domains) {
        await this.removeFromDomainDictionary(termId, domain);
      }
      
    } catch (error) {
      console.error('Error deleting term:', error);
      throw new Error('Failed to delete term');
    }
  }

  // 辅助方法
  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private async loadAllDomainTerms(): Promise<Term[]> {
    try {
      const domains = ['frontend', 'backend', 'ai', 'other'];
      const allTerms: Term[] = [];
      const termIds = new Set<string>();
      
      for (const domain of domains) {
        const domainTerms = await this.loadTerms(domain);
        for (const term of domainTerms) {
          if (!termIds.has(term.id || '')) {
            allTerms.push(term);
            if (term.id) {
              termIds.add(term.id);
            }
          }
        }
      }
      
      return allTerms;
    } catch (error) {
      console.error('Error loading all domain terms:', error);
      return [];
    }
  }

  private async saveToDomainDictionary(term: Term, domain: string): Promise<void> {
    const domainFilePath = path.join(this.basePath, `terms-${domain}.json`);
    let domainDict: DomainDictionary = {
      domain,
      count: 0,
      terms: []
    };
    
    // 如果文件存在，读取现有数据
    if (fs.existsSync(domainFilePath)) {
      try {
        const data = fs.readFileSync(domainFilePath, 'utf8');
        domainDict = JSON.parse(data);
      } catch (e) {
        console.error(`Error reading domain dictionary ${domain}:`, e);
      }
    }
    
    // 检查术语是否已存在
    const existingIndex = domainDict.terms.findIndex(t => t.id === term.id);
    
    if (existingIndex >= 0) {
      // 更新现有术语
      domainDict.terms[existingIndex] = term;
    } else {
      // 添加新术语
      domainDict.terms.push(term);
    }
    
    // 更新计数
    domainDict.count = domainDict.terms.length;
    
    // 保存回文件
    fs.writeFileSync(domainFilePath, JSON.stringify(domainDict, null, 2));
  }

  private async removeFromDomainDictionary(termId: string, domain: string): Promise<void> {
    const domainFilePath = path.join(this.basePath, `terms-${domain}.json`);
    
    if (!fs.existsSync(domainFilePath)) {
      return;
    }
    
    try {
      const data = fs.readFileSync(domainFilePath, 'utf8');
      const domainDict: DomainDictionary = JSON.parse(data);
      
      // 过滤掉要删除的术语
      domainDict.terms = domainDict.terms.filter(t => t.id !== termId);
      domainDict.count = domainDict.terms.length;
      
      // 保存回文件
      fs.writeFileSync(domainFilePath, JSON.stringify(domainDict, null, 2));
    } catch (e) {
      console.error(`Error updating domain dictionary ${domain}:`, e);
    }
  }
}