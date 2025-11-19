// Term Dictionary Module - Main Entry Point

// Export core components
export type { TermManager } from './components/TermManager';

// Export models
export type { Term } from './models/Term';
export type { DictionaryMetadata } from './models/DictionaryMetadata';
export type { DomainDictionary } from './models/DomainDictionary';
export type { MainDictionary } from './models/MainDictionary';
export type { QueryOptions } from './models/QueryOptions';

// Export implementations
import { TermManagerImpl as TermManager } from './components/TermManager';
import { FileStorage } from './storage/FileStorage';

// Version information
export const VERSION: string = '0.1.0';

export default {
  TermManager,
  FileStorage,
  VERSION
};