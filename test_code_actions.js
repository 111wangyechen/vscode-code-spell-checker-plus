// 测试脚本：测试修复后的代码操作功能
import { constructSettingsForText } from 'cspell-lib';

import { SuggestionGenerator } from './packages/_server/src/SuggestionsGenerator.mts';

async function testCodeActions() {
    // 创建 SuggestionGenerator 实例
    const generator = new SuggestionGenerator();
    
    // 测试文本包含多个拼写错误
    const text = `import tensrflow from 'tensrflow';
const nodej = require('nodej');`;
    
    // 获取配置
    const settings = constructSettingsForText(text);
    
    // 为每个拼写错误生成建议
    const misspelledWords = ['tensrflow', 'nodej'];
    
    for (const word of misspelledWords) {
        console.log(`\n为单词 "${word}" 生成建议:`);
        const suggestions = await generator.genWordSuggestions(word, settings);
        console.log('建议词:', suggestions);
        
        if (word === 'tensrflow') {
            console.log('是否包含 "tensorflow":', suggestions.includes('tensorflow'));
        }
    }
}

testCodeActions().catch(console.error);
