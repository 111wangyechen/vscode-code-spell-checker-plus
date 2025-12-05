#!/bin/bash

# 测试单词
word="tensrflow"
expected="tensorflow"

# 创建临时测试文件
temp_file="temp_test.txt"
echo $word > $temp_file

# 运行 cspell 命令获取建议
echo "=== 测试 \"$word\" 的拼写建议 ==="
echo "\n1. 检查字典文件:"

# 检查字典中是否包含 TensorFlow
dictionary_path="sampleDictionaries/tech-terms/ai-terms.txt"
if [ -f "$dictionary_path" ]; then
    echo "字典文件存在: $dictionary_path"
    contains_tensorflow=$(grep -i "tensorflow" "$dictionary_path")
    if [ -n "$contains_tensorflow" ]; then
        echo "✓ 字典中包含 TensorFlow"
    else
        echo "✗ 字典中不包含 TensorFlow"
    fi
else
    echo "✗ 字典文件不存在: $dictionary_path"
fi

echo "\n2. 使用 cspell 生成拼写建议:"
cspell_output=$(npx cspell --show-suggestions "$temp_file")

echo "\nCSpell 输出:"
echo "$cspell_output"

# 检查建议中是否包含 tensorflow
echo "\n3. 检查建议中是否包含 \"$expected\":"
if [[ "$cspell_output" == *"$expected"* ]] || [[ "$cspell_output" == *"${expected^}"* ]]; then
    echo "✓ 拼写建议中包含 \"$expected\""
    echo "\n🎉 测试通过!"
    result=0
else
    echo "✗ 拼写建议中不包含 \"$expected\""
    echo "\n❌ 测试失败!"
    result=1
fi

# 清理临时文件
rm "$temp_file"

exit $result