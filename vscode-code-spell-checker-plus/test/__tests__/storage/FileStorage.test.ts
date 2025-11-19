import * as fs from 'fs';
import * as path from 'path';
import { FileStorage } from '../../../src/storage';
import { Term } from '../../../src/models';

describe('FileStorage', () => {
  let storage: FileStorage;
  const testDir = path.join(__dirname, 'test-data');
  const mainDictPath = path.join(testDir, 'terms.json');
  const frontendDictPath = path.join(testDir, 'terms-frontend.json');
  const backendDictPath = path.join(testDir, 'terms-backend.json');

  beforeEach(() => {
    // 创建测试目录
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // 清理所有相关的测试文件
    const testFiles = [
      mainDictPath,
      frontendDictPath,
      backendDictPath,
      path.join(testDir, 'terms-ai.json'),
      path.join(testDir, 'terms-other.json')
    ];
    
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    // 创建存储实例，确保使用测试目录
    storage = new FileStorage(testDir);
  });

  afterAll(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }
      fs.rmdirSync(testDir);
    }
  });

  describe('saveTerm', () => {
    it('should save a term to the main dictionary', async () => {
      const term: Term = {
        id: 'test-1',
        text: 'TestTerm',
        variations: ['testterm'],
        domains: ['test'],
        confidence: 0.9,
        frequency: 10,
        sources: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storage.saveTerm(term);

      // 验证主字典文件存在
      expect(fs.existsSync(mainDictPath)).toBe(true);
      
      // 读取并验证内容
      const data = fs.readFileSync(mainDictPath, 'utf8');
      const dict = JSON.parse(data);
      
      expect(dict.metadata.total_terms).toBe(1);
      expect(dict.terms.length).toBe(1);
      expect(dict.terms[0].text).toBe('TestTerm');
    });

    it('should save a term to domain dictionaries', async () => {
      const term: Term = {
        id: 'react-1',
        text: 'React',
        variations: [],
        domains: ['frontend'],
        confidence: 0.95,
        frequency: 50,
        sources: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storage.saveTerm(term);

      // 验证领域字典文件存在
      expect(fs.existsSync(frontendDictPath)).toBe(true);
      
      // 读取并验证内容
      const data = fs.readFileSync(frontendDictPath, 'utf8');
      const domainDict = JSON.parse(data);
      
      expect(domainDict.domain).toBe('frontend');
      expect(domainDict.count).toBe(1);
      expect(domainDict.terms.length).toBe(1);
      expect(domainDict.terms[0].text).toBe('React');
    });
  });

  describe('loadTerms', () => {
    beforeEach(async () => {
      // 预先保存一些术语
      const terms: Term[] = [
        {
          id: 'ts-1',
          text: 'TypeScript',
          variations: ['TS'],
          domains: ['frontend'],
          confidence: 0.9,
          frequency: 100,
          sources: ['test'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'node-1',
          text: 'NodeJS',
          variations: [],
          domains: ['backend'],
          confidence: 0.85,
          frequency: 80,
          sources: ['test'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const term of terms) {
        await storage.saveTerm(term);
      }
    });

    it('should load all terms from main dictionary', async () => {
      const terms = await storage.loadTerms();
      
      expect(terms.length).toBe(2);
      expect(terms.map(t => t.text).sort()).toEqual(['NodeJS', 'TypeScript']);
    });

    it('should load terms for a specific domain', async () => {
      const frontendTerms = await storage.loadTerms('frontend');
      
      expect(frontendTerms.length).toBe(1);
      expect(frontendTerms[0].text).toBe('TypeScript');
      
      const backendTerms = await storage.loadTerms('backend');
      
      expect(backendTerms.length).toBe(1);
      expect(backendTerms[0].text).toBe('NodeJS');
    });

    it('should return empty array for non-existent domain', async () => {
      const terms = await storage.loadTerms('nonexistent');
      expect(terms.length).toBe(0);
    });
  });

  describe('deleteTerm', () => {
    beforeEach(async () => {
      // 预先保存术语（测试隔离由外层beforeEach保证）
      const term: Term = {
        id: 'delete-1',
        text: 'DeleteMe',
        variations: [],
        domains: ['frontend', 'backend'],
        confidence: 0.8,
        frequency: 10,
        sources: ['test'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await storage.saveTerm(term);
    });

    it('should delete a term from all dictionaries', async () => {
      // 先验证术语存在
      let terms = await storage.loadTerms();
      expect(terms.length).toBe(1);
      expect(terms[0].text).toBe('DeleteMe');
      
      // 删除术语
      await storage.deleteTerm('delete-1');
      
      // 验证术语已删除
      terms = await storage.loadTerms();
      expect(terms.length).toBe(0);
      
      // 验证领域字典中的术语也已删除
      const frontendTerms = await storage.loadTerms('frontend');
      expect(frontendTerms.length).toBe(0);
    });
  });
});