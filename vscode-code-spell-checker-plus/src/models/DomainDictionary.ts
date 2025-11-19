import { Term } from './Term';

export interface DomainDictionary {
  domain: string;
  count: number;
  terms: Term[];
}