export interface QueryOptions {
  domains?: string[];      // 过滤特定领域
  confidenceThreshold?: number; // 置信度阈值
  limit?: number;          // 返回结果数量限制
  includeVariations?: boolean; // 是否包含变体
  sortBy?: 'frequency' | 'confidence' | 'createdAt'; // 排序方式
}