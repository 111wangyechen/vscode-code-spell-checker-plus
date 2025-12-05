import * as cspell from 'cspell-lib';
import { describe, expect, test } from 'vitest';

import { maxNumberOfSuggestionsForLongWords, SuggestionGenerator } from './SuggestionsGenerator.mjs';

const timeout = 30000;

describe('Validate Suggestions', () => {
    interface DocInfo {
        languageId: string;
        text?: string;
    }

    test(
        'genWordSuggestions',
        async () => {
            const gen = new SuggestionGenerator(getSettings);
            const doc = { languageId: 'typescript', text: '' };
            const { settings } = await getSettings(doc);
            const result = await gen.genWordSuggestions(doc, 'code');
            const resultWords = result.map((s) => s.word);
            expect(resultWords).toContain('code');
            // 根据需求，我们最多生成3个高质量的候选词
            expect(result).toHaveLength(Math.min(settings.numSuggestions || 0, 3));
        },
        timeout,
    );

    test(
        'genWordSuggestions for long words',
        async () => {
            const gen = new SuggestionGenerator(getSettings);
            const doc = { languageId: 'typescript', text: '' };
            const result = await gen.genWordSuggestions(doc, 'Acknowledgements');
            expect(result).toHaveLength(maxNumberOfSuggestionsForLongWords);
            expect(result.map((s) => s.word)).toContain('acknowledgements');
        },
        timeout,
    );

    test(
        'test multiple misspellings in same text should still generate suggestions',
        async () => {
            // 测试包含多个拼写错误的文本
            const text = `import tensrflow from 'tensrflow';
const nodej = require('nodej');`;
            const gen = new SuggestionGenerator(getSettings);
            const doc = { languageId: 'typescript', text };
            
            // 为第一个拼写错误生成建议
            const result1 = await gen.genWordSuggestions(doc, 'tensrflow');
            expect(result1.map((s) => s.word)).toContain('tensorflow');
            
            // 为第二个拼写错误生成建议
            const result2 = await gen.genWordSuggestions(doc, 'nodej');
            expect(result2.length).toBeGreaterThan(0);
        },
        timeout,
    );

    test('test tensor flow', async () => {
        const gen = new SuggestionGenerator(getSettings);
        const doc = { languageId: 'typescript', text: '' };
        const suggestions = await gen.genWordSuggestions(doc, 'tensrflow');
        expect(suggestions.length).toBeLessThanOrEqual(3);
        expect(suggestions.map(s => s.word)).toContain('tensorflow');
    });

    async function getSettings(doc: DocInfo) {
        const settings = await cspell.constructSettingsForText(await cspell.getDefaultSettings(), doc.text || '', doc.languageId);
        const dictionary = await cspell.getDictionary(settings);
        return { settings, dictionary };
    }
});
