export interface Term {
  id?: string;          // 唯一标识符
  text: string;         // 术语文本
  variations: string[]; // 变体形式
  domains: string[];    // 所属领域
  confidence: number;   // 置信度 (0-1)
  frequency: number;    // 出现频率
  sources: string[];    // 来源
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
  contexts?: string[];  // 上下文信息
  tags?: string[];      // 标签
}