export interface SearchFormData {
  query: string;
  title: string;
  creator: string;
  yearFrom: string;
  yearTo: string;
  language: string;
  searchMode: 'full_text' | 'metadata' | 'both';
}

export interface QueueItem {
  identifier: string;
  title?: string;
  creator?: string;
  year?: string;
  selectedFormat: string;
  formats: string[];
  size: string;
}

export interface DownloadItem {
  id: string;
  identifier: string;
  fileName: string;
  format: string;
  url: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress?: number;
  error?: string;
}

export type SearchMode = 'full_text' | 'metadata' | 'both';

export const LANGUAGES = [
  { value: '', label: 'Any language (Recommended)' },
  { value: 'Russian', label: 'Russian' },
  { value: 'English', label: 'English' },
  { value: 'German', label: 'German' },
  { value: 'French', label: 'French' },
  { value: 'Church Slavic', label: 'Church Slavic' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Latin', label: 'Latin' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Italian', label: 'Italian' },
];

export const SEARCH_MODES = [
  { value: 'fulltext', label: 'Full text' },
  { value: 'metadata', label: 'Metadata' },
  { value: 'both', label: 'Both' },
] as const;

export interface AppSettings {
  downloadFolder: string;
  preferredFormat: string;
}
