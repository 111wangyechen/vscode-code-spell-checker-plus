# 测试单词
$word = "tensrflow"
$expected = "tensorflow"

# 创建临时测试文件
$temp_file = "temp_test.txt"
Set-Content -Path $temp_file -Value $word

# 运行 cspell 命令获取建议
Write-Host "=== 测试 \"$word\" 的拼写建议 ==="
Write-Host ""
Write-Host "1. 检查字典文件:"

# 检查字典中是否包含 TensorFlow
$dictionary_path = "sampleDictionaries/tech-terms/ai-terms.txt"
if (Test-Path "$dictionary_path") {
    Write-Host "字典文件存在: $dictionary_path"
    $contains_tensorflow = Select-String -Path "$dictionary_path" -Pattern "tensorflow" -CaseSensitive:$false
    if ($contains_tensorflow) {
        Write-Host "✓ 字典中包含 TensorFlow"
    } else {
        Write-Host "✗ 字典中不包含 TensorFlow"
    }
} else {
    Write-Host "✗ 字典文件不存在: $dictionary_path"
}

Write-Host ""
Write-Host "2. 使用 cspell 生成拼写建议:"

# 运行 cspell 命令
$cspell_output = & npx cspell --show-suggestions "$temp_file" 2>&1

Write-Host ""
Write-Host "CSpell 输出:" 
Write-Host "$cspell_output"

# 检查建议中是否包含 tensorflow
Write-Host ""
Write-Host "3. 检查建议中是否包含 \"$expected\":"
if ($cspell_output -match $expected -or $cspell_output -match "${expected^}") {
    Write-Host "✓ 拼写建议中包含 \"$expected\""
    Write-Host ""
    Write-Host "🎉 测试通过!"
    $result = 0
} else {
    Write-Host "✗ 拼写建议中不包含 \"$expected\""
    Write-Host ""
    Write-Host "❌ 测试失败!"
    $result = 1
}

# 清理临时文件
Remove-Item -Path $temp_file -Force

Exit $result