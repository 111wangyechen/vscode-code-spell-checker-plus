import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试单词
const wordToCheck = 'tensrflow';

// 第一步：检查字典文件内容
function checkDictionaryContent() {
    try {
        // 检查 tech-terms-ai 字典路径
        const aiTermsPath = path.join(__dirname, 'sampleDictionaries', 'tech-terms', 'ai-terms.txt');
        console.log('ai-terms.txt 路径:', aiTermsPath);
        
        if (!fs.existsSync(aiTermsPath)) {
            console.error('ai-terms.txt 文件不存在');
            return false;
        }
        
        // 检查 ai-terms.txt 中是否包含 TensorFlow
        const aiTermsContent = fs.readFileSync(aiTermsPath, 'utf8');
        const containsTensorFlow = aiTermsContent.includes('TensorFlow');
        console.log('字典中包含 TensorFlow:', containsTensorFlow);
        
        // 显示包含 TensorFlow 的行
        const lines = aiTermsContent.split('\n');
        const tensorflowLines = lines.filter(line => line.includes('TensorFlow'));
        console.log('包含 TensorFlow 的行:', tensorflowLines);
        
        return containsTensorFlow;
    } catch (error) {
        console.error('检查字典内容时出错:', error);
        return false;
    }
}

// 第二步：使用 cspell 命令行工具测试拼写建议
function testWithCSpellCLI() {
    return new Promise((resolve) => {
        console.log('\n使用 cspell 命令行工具测试拼写建议:');
        
        // 创建临时测试文件
        const testFilePath = path.join(__dirname, 'test-tensrflow.js');
        const testContent = `// 测试文件
const tensrflow = require('tensrflow'); // 故意拼写错误`;
        
        fs.writeFileSync(testFilePath, testContent);
        
        // 运行 cspell 命令
        const cspell = spawn('npx', ['cspell', '--show-suggestions', testFilePath]);
        
        let output = '';
        let error = '';
        
        cspell.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        cspell.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        cspell.on('close', (code) => {
            // 清理临时文件
            fs.unlinkSync(testFilePath);
            
            if (error) {
                console.error('cspell 命令错误:', error);
                resolve(false);
                return;
            }
            
            console.log('cspell 输出:');
            console.log(output);
            
            // 检查输出中是否包含 tensorflow 建议
            const containsTensorFlow = output.includes('tensorflow') || output.includes('TensorFlow');
            console.log('建议中包含 tensorflow:', containsTensorFlow);
            
            resolve(containsTensorFlow);
        });
    });
}

// 执行测试
async function runTests() {
    console.log('=== 拼写建议测试 ===');
    
    console.log('\n1. 检查字典内容:');
    const isInDictionary = checkDictionaryContent();
    
    console.log('\n2. 测试拼写建议生成:');
    const isInSuggestions = await testWithCSpellCLI();
    
    console.log('\n=== 测试总结 ===');
    console.log('TensorFlow 是否在字典中:', isInDictionary);
    console.log('tensorflow 是否在拼写建议中:', isInSuggestions);
    
    if (isInDictionary && isInSuggestions) {
        console.log('\n✓ 测试通过："tensrflow" 的拼写建议包含 "tensorflow"');
    } else {
        console.log('\n✗ 测试失败："tensrflow" 的拼写建议不包含 "tensorflow"');
    }
}

runTests();