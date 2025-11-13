import { DictionaryMetadata } from './DictionaryMetadata';
import { Term } from './Term';

export interface MainDictionary {
  metadata: DictionaryMetadata;
  terms: Term[];
}