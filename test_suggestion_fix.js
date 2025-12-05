// 直接测试修复后的拼写建议功能
import { SuggestionGenerator } from './packages/_server/src/spellChecker/SuggestionsGenerator.mts';
import { constructSettingsForText } from './packages/_server/src/utils/constructSettingsForText.mts';

// 创建测试文本
const text = 'I love using tensrflow for machne learning with nodej and reat';
const document = {
    uri: 'file:///test.js',
    getText: () => text,
    languageId: 'javascript'
};

async function testSuggestions() {
    try {
        // 创建设置
        const settings = await constructSettingsForText(document, text);
        
        // 创建SuggestionGenerator实例
        const generator = new SuggestionGenerator(() => settings);
        
        // 测试每个拼写错误的建议
        const misspellings = ['tensrflow', 'machne', 'nodej', 'reat'];
        
        for (const word of misspellings) {
            console.log(`\nTesting suggestions for: ${word}`);
            const suggestions = await generator.genWordSuggestions(document, word);
            console.log(`Suggestions: ${suggestions.map(s => s.word).join(', ')}`);
            
            // 检查是否有合理的建议
            if (suggestions.length > 0) {
                console.log(`✓ Found ${suggestions.length} suggestions`);
            } else {
                console.log(`✗ No suggestions found`);
            }
        }
        
    } catch (error) {
        console.error('Error testing suggestions:', error);
    }
}

testSuggestions();