import { useState } from 'react';
import { LANGUAGES } from '../types';
import type { SearchFormData } from '../types';
import { SearchIcon } from './Icons';

interface SearchSidebarProps {
  onSearch: (data: SearchFormData) => void;
  isLoading: boolean;
}

const initialFormData: SearchFormData = {
  query: '',
  title: '',
  creator: '',
  yearFrom: '',
  yearTo: '',
  language: '',
  searchMode: 'metadata',
};

export function SearchSidebar({ onSearch, isLoading }: SearchSidebarProps) {
  const [formData, setFormData] = useState<SearchFormData>(initialFormData);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.query && !formData.creator && !formData.title) return;
    onSearch(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            name="query"
            placeholder="Search query..."
            value={formData.query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <div className="search-icon">
            <SearchIcon />
          </div>
        </div>

        <div className="sidebar-title">Search in</div>
        <div className="toggle-group">
          <button
            type="button"
            className={`toggle-btn ${formData.searchMode === 'full_text' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, searchMode: 'full_text' }))}
          >
            Full text
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.searchMode === 'metadata' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, searchMode: 'metadata' }))}
          >
            Metadata
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.searchMode === 'both' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, searchMode: 'both' }))}
          >
            Both
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">Filters</div>

        <div className="field">
          <label className="field-label">Author</label>
          <input
            type="text"
            className="field-input"
            name="creator"
            placeholder="e.g. Толстой"
            value={formData.creator}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field">
          <label className="field-label">Title</label>
          <input
            type="text"
            className="field-input"
            name="title"
            placeholder="Book or journal title"
            value={formData.title}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field-label">Year from</label>
            <input
              type="text"
              className="field-input"
              name="yearFrom"
              placeholder="1800"
              value={formData.yearFrom}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="field">
            <label className="field-label">Year to</label>
            <input
              type="text"
              className="field-input"
              name="yearTo"
              placeholder="1920"
              value={formData.yearTo}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="field">
          <label className="field-label">Language</label>
          <select
            className="field-select"
            name="language"
            value={formData.language}
            onChange={handleChange}
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        className="search-btn"
        onClick={() => handleSubmit()}
        disabled={isLoading || (!formData.query && !formData.creator && !formData.title)}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </aside>
  );
}
