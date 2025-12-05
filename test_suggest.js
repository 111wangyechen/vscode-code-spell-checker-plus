// 简单测试拼写建议的脚本
const { SpellingDictionaryCollection, createSpellingDictionaryFromTrieFile, createSpellingDictionaryFromTextFile } = require('cspell-lib');
const fs = require('fs');
const path = require('path');

// 测试单词
const wordToCheck = 'tensrflow';

// 创建一个简单的测试脚本
async function testSuggestions() {
    console.log(`=== 测试 "${wordToCheck}" 的拼写建议 ===`);
    
    try {
        // 检查 AI 术语字典
        const aiTermsPath = path.join(__dirname, 'sampleDictionaries', 'tech-terms', 'ai-terms.txt');
        console.log('\n1. 检查字典文件:', aiTermsPath);
        
        if (!fs.existsSync(aiTermsPath)) {
            console.error('字典文件不存在');
            return;
        }
        
        // 读取字典内容
        const aiTermsContent = fs.readFileSync(aiTermsPath, 'utf8');
        const containsTensorFlow = aiTermsContent.includes('TensorFlow');
        console.log('字典中包含 TensorFlow:', containsTensorFlow);
        
        // 使用 cspell-lib 创建字典并获取建议
        console.log('\n2. 使用 cspell-lib 获取拼写建议:');
        
        // 注意：这里我们直接使用 cspell 命令行工具而不是尝试导入库，
        // 因为在这个项目中直接导入库可能需要额外的配置
        
        const { spawnSync } = require('child_process');
        
        // 创建一个临时文件来测试
        const tempFilePath = path.join(__dirname, 'temp-test.txt');
        fs.writeFileSync(tempFilePath, wordToCheck);
        
        // 运行 cspell 命令获取建议
        const result = spawnSync('npm', ['exec', 'cspell', '--', '--show-suggestions', tempFilePath], {
            cwd: __dirname,
            encoding: 'utf8'
        });
        
        // 清理临时文件
        fs.unlinkSync(tempFilePath);
        
        // 输出结果
        console.log('退出码:', result.status);
        console.log('\n输出:');
        console.log(result.stdout || '无输出');
        
        if (result.stderr) {
            console.log('\n错误:');
            console.log(result.stderr);
        }
        
        // 检查建议中是否包含 tensorflow
        const hasTensorFlowSuggestion = (result.stdout || '').toLowerCase().includes('tensorflow');
        console.log('\n拼写建议中包含 tensorflow:', hasTensorFlowSuggestion);
        
        if (hasTensorFlowSuggestion) {
            console.log('\n✓ 测试通过："tensrflow" 的拼写建议包含 "tensorflow"');
        } else {
            console.log('\n✗ 测试失败："tensrflow" 的拼写建议不包含 "tensorflow"');
        }
        
    } catch (error) {
        console.error('测试过程中出错:', error);
    }
}

testSuggestions();