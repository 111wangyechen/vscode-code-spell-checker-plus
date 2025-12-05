// 测试脚本：直接使用 SuggestionGenerator 测试拼写建议
import { constructSettingsForText } from 'cspell-lib';

import { SuggestionGenerator } from './packages/_server/dist/SuggestionsGenerator.js';

async function testSuggestions() {
    // 创建 SuggestionGenerator 实例
    const generator = new SuggestionGenerator();
    
    // 测试文本包含多个拼写错误
    const text = `import tensrflow from 'tensrflow';
const nodej = require('nodej');`;
    
    // 获取配置
    const settings = constructSettingsForText(text);
    
    // 为 "tensrflow" 生成建议
    const suggestions = await generator.genWordSuggestions('tensrflow', settings);
    
    console.log('建议词:', suggestions);
    console.log('是否包含 "tensorflow":', suggestions.includes('tensorflow'));
}

testSuggestions().catch(console.error);
