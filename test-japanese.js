// 日文检查器测试文件

// 测试1: 正确的日文变量名
const ユーザー名 = 'test user';
const データベース = 'test database';
const サーバー = 'test server';

// 测试2: 日文注释
// これはテストファイルです
// 日本語のコメントをチェックします

// 测试3: 混合使用
const テストデータ = {
    名前: 'タロウ',
    年齢: 25,
    住所: '東京都'
};

// 测试4: 平假名
const てすと = 'test';
const でーた = 'data';

// 测试5: 片假名
const テスト = 'test';
const デー = 'data';

// 测试6: 混合日英文
const userデータ = {};
const test結果 = null;

// 测试7: 技术术语(应该被识别)
const tensorflow = 'TensorFlow';
const react = 'React';
const kubernetes = 'Kubernetes';

console.log('日文检查器测试完成');
