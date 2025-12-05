import * as cspell from 'cspell-lib';

import { SuggestionGenerator } from './packages/_server/src/SuggestionsGenerator.mts';

// 测试单词
const wordToCheck = 'tensrflow';
const expectedSuggestion = 'tensorflow';

interface DocInfo {
    languageId: string;
    text?: string;
}

async function getSettings(doc: DocInfo) {
    const settings = await cspell.constructSettingsForText(await cspell.getDefaultSettings(), doc.text || '', doc.languageId);
    const dictionary = await cspell.getDictionary(settings);
    return { settings, dictionary };
}

async function testTensorFlowSuggestion() {
    console.log(`=== 测试 "${wordToCheck}" 的拼写建议 ===`);
    
    try {
        // 创建 SuggestionGenerator 实例
        const gen = new SuggestionGenerator(getSettings);
        const doc = { languageId: 'javascript', text: '' };
        
        // 生成拼写建议
        console.log(`\n生成 "${wordToCheck}" 的拼写建议...`);
        const suggestions = await gen.genWordSuggestions(doc, wordToCheck);
        
        // 输出所有建议
        console.log(`\n找到 ${suggestions.length} 个建议:`);
        suggestions.forEach((sug, index) => {
            console.log(`${index + 1}. ${sug.word}`);
        });
        
        // 检查是否包含期望的建议
        const suggestionWords = suggestions.map(s => s.word.toLowerCase());
        const containsExpectedSuggestion = suggestionWords.includes(expectedSuggestion.toLowerCase());
        
        console.log(`\n拼写建议中包含 "${expectedSuggestion}":`, containsExpectedSuggestion);
        
        if (containsExpectedSuggestion) {
            console.log(`\n✓ 测试通过："${wordToCheck}" 的拼写建议包含 "${expectedSuggestion}"`);
        } else {
            console.log(`\n✗ 测试失败："${wordToCheck}" 的拼写建议不包含 "${expectedSuggestion}"`);
        }
        
        return containsExpectedSuggestion;
    } catch (error) {
        console.error('\n测试过程中出错:', error);
        return false;
    }
}

testTensorFlowSuggestion();