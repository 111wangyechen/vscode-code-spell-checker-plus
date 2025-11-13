export interface DictionaryMetadata {
  version: string;
  generated_at: string; // ISO8601时间
  source_projects: number;
  total_terms: number;
}