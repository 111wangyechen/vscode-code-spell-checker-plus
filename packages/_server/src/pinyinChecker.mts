import type { ValidationIssue } from 'cspell-lib';
import { pinyin as pinyinConverter } from 'pinyin';
import type { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * 中文拼音拼写检查器
 * 检查中文变量名是否为拼音，确保拼音拼写正确
 */
export class PinyinChecker {
    /**
     * 检查文本中的中文变量名拼音拼写
     * @param textDocument 文本文档对象
     * @returns 拼音拼写错误的验证问题数组
     */
    static checkPinyinVariables(textDocument: TextDocument): ValidationIssue[] {
        const content = textDocument.getText();
        const issues: ValidationIssue[] = [];
        
        // 正则表达式匹配可能的中文变量名（包含中文的标识符）
        // 匹配规则：中文开头或包含中文的标识符
        const chineseVarRegex = /([\u4e00-\u9fa5][\u4e00-\u9fa5a-zA-Z0-9_]*)/g;
        
        let match;
        while ((match = chineseVarRegex.exec(content)) !== null) {
            const variableName = match[0];
            const offset = match.index;
            const length = variableName.length;
            
            // 检查变量名是否为拼音
            if (!this.isValidPinyin(variableName)) {
                issues.push({
                    text: variableName,
                    offset,
                    length,
                    line: textDocument.positionAt(offset).line as any,
                    message: '变量名可能包含错误的拼音拼写',
                    issueType: undefined as any,
                    isFlagged: false,
                    suggestions: this.getPinyinSuggestions(variableName),
                    suggestionsEx: undefined,
                    hasPreferredSuggestions: false,
                    hasSimpleSuggestions: true,
                });
            }
        }
        
        return issues;
    }
    
    /**
     * 检查文本是否为有效的拼音
     * @param text 要检查的文本
     * @returns 是否为有效的拼音
     */
    private static isValidPinyin(text: string): boolean {
        try {
            // 将中文转换为拼音
            const pinyinArray = pinyinConverter(text, {
                style: pinyinConverter.STYLE_NORMAL,
                heteronym: false,
            });
            
            // 扁平化为一维数组
            const flatPinyin = pinyinArray.flat();
            
            // 检查是否所有字符都能正确转换为拼音
            // 注意：这里使用的是简单判断，实际应用中可能需要更复杂的规则
            return flatPinyin.length === text.length;
        } catch (error) {
            console.error('拼音转换错误:', error);
            return false;
        }
    }
    
    /**
     * 获取拼音拼写建议
     * @param text 原始文本
     * @returns 拼音拼写建议数组
     */
    private static getPinyinSuggestions(text: string): string[] {
        try {
            // 将中文转换为拼音
            const pinyinArray = pinyinConverter(text, {
                style: pinyinConverter.STYLE_NORMAL,
                heteronym: false,
            });
            
            // 扁平化为一维数组
            const flatPinyin = pinyinArray.flat();
            
            // 简单返回拼音组合作为建议
            return [flatPinyin.join('')];
        } catch (error) {
            console.error('获取拼音建议错误:', error);
            return [];
        }
    }
}
