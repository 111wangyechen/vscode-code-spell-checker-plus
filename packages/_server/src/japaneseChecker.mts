// @ts-ignore - kuromoji没有类型声明文件
import type { ValidationIssue } from 'cspell-lib';
import * as kuromoji from 'kuromoji';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import type { TextDocument } from 'vscode-languageserver-textdocument';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 日文变量名检查器
 * 检查日文变量名是否使用了合适的日语单词组合
 */
export class JapaneseChecker {
    private static tokenizer: kuromoji.Tokenizer | null = null;
    private static isTokenizerReady = false;
    private static initPromise: Promise<void> | null = null;
    
    /**
     * 初始化kuromoji分词器
     */
    private static async initTokenizer(): Promise<void> {
        if (this.isTokenizerReady) return;
        
        if (!this.initPromise) {
            this.initPromise = new Promise((resolve, reject) => {
                // 使用正确的字典路径 - 相对于当前文件向上3级目录找到node_modules
                const dicPath = join(__dirname, '../../../node_modules/kuromoji/dict');
                
                kuromoji.builder({
                    dicPath: dicPath
                }).build((err: unknown, tokenizer: unknown) => {
                    if (err) {
                        console.error('初始化kuromoji分词器失败:', err);
                        console.error('尝试的字典路径:', dicPath);
                        reject(err);
                        return;
                    }
                    this.tokenizer = tokenizer as kuromoji.Tokenizer;
                    this.isTokenizerReady = true;
                    console.log('kuromoji分词器初始化成功');
                    resolve();
                });
            });
        }
        
        await this.initPromise;
    }
    
    /**
     * 检查文本中的日文变量名
     * @param textDocument 文本文档对象
     * @returns 日文变量名问题的验证问题数组
     */
    static async checkJapaneseVariables(textDocument: TextDocument): Promise<ValidationIssue[]> {
        // 确保分词器已初始化
        try {
            await this.initTokenizer();
        } catch (error) {
            console.error('日文检查器初始化失败，跳过检查:', error);
            return [];
        }
        
        const content = textDocument.getText();
        const issues: ValidationIssue[] = [];
        
        // 正则表达式匹配可能的日文变量名（包含日文的标识符）
        // 匹配规则：日文开头或包含日文的标识符
        const japaneseVarRegex = /([\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f][\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9fa-zA-Z0-9_]*)/g;
        
        let match;
        while ((match = japaneseVarRegex.exec(content)) !== null) {
            const variableName = match[0];
            const offset = match.index;
            const length = variableName.length;
            
            // 检查变量名是否使用了合适的日语单词组合
            if (!this.isValidJapaneseVariable(variableName)) {
                issues.push({
                    text: variableName,
                    offset,
                length,
                line: textDocument.positionAt(offset).line as any,
                    message: '变量名可能包含不规范的日语单词组合',
                    issueType: undefined as any,
                    isFlagged: false,
                    suggestions: this.getJapaneseVariableSuggestions(variableName),
                    suggestionsEx: undefined,
                    hasPreferredSuggestions: false,
                    hasSimpleSuggestions: true,
                });
            }
        }
        
        return issues;
    }
    
    /**
     * 检查日文变量名是否有效
     * @param variableName 变量名
     * @returns 是否有效
     */
    private static isValidJapaneseVariable(variableName: string): boolean {
        if (!this.tokenizer) return false;
        
        try {
            // 使用kuromoji分词器分析变量名
            const tokens = this.tokenizer.tokenize(variableName);
            
            // 检查是否能够正常分词
            // 如果分词结果为空或只有一个未知词，可能表示变量名组合不规范
            if (!tokens || tokens.length === 0) {
                return false;
            }
            
            // 检查是否所有词都能被识别
            const hasUnknownWords = tokens.some((token: any) => 
                token.pos === 'UNKNOWN' || !token.pos
            );
            
            return !hasUnknownWords;
        } catch (error) {
            console.error('分析日文变量名失败:', error);
            return false;
        }
    }
    
    /**
     * 获取日文变量名的建议
     * @param variableName 原始变量名
     * @returns 建议数组
     */
    private static getJapaneseVariableSuggestions(_variableName: string): string[] {
        // 简单实现：将日文转换为罗马字作为建议
        // 实际应用中可以根据分词结果提供更准确的建议
        const suggestions: string[] = [];
        
        // 这里可以扩展为更复杂的建议生成逻辑
        // 例如：使用分词结果重组变量名，或提供罗马字转换
        
        return suggestions;
    }
}
