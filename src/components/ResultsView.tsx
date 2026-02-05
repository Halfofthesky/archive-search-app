import { useMemo } from 'react';
import type { SearchResponse, SearchResult } from '../lib/archive-api';
import { BookIcon, ListIcon, GridIcon, CheckIcon, ExternalIcon } from './Icons';

interface ResultsViewProps {
  response: SearchResponse | null;
  isLoading: boolean;
  query: string;
  selected: Set<string>;
  viewMode: 'list' | 'grid';
  sortBy: string;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
}

export function ResultsView({
  response,
  isLoading,
  query,
  selected,
  viewMode,
  sortBy,
  onToggleSelect,
  onSelectAll,
  onViewModeChange,
  onSortChange,
  onPageChange,
}: ResultsViewProps) {
  if (isLoading) {
    return (
      <div className="content">
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 24px' }} />
          <h2 className="empty-title">Searching...</h2>
          <p className="empty-text">Querying Archive.org with transliteration variants</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="content">
        <div className="empty-state">
          <BookIcon />
          <h2 className="empty-title">Search Archive.org</h2>
          <p className="empty-text">Enter a query to search through millions of books and texts</p>
        </div>
      </div>
    );
  }

  if (response.results.length === 0) {
    return (
      <div className="content">
        <div className="empty-state">
          <BookIcon />
          <h2 className="empty-title">No results found</h2>
          <p className="empty-text">Try adjusting your search terms or filters</p>
        </div>
      </div>
    );
  }

  const sortedResults = useMemo(() => {
    const results = [...response.results];
    switch (sortBy) {
      case 'date-desc':
        return results.sort((a, b) => {
          const ya = parseInt(a.year || '0', 10);
          const yb = parseInt(b.year || '0', 10);
          return yb - ya;
        });
      case 'date-asc':
        return results.sort((a, b) => {
          const ya = parseInt(a.year || '9999', 10);
          const yb = parseInt(b.year || '9999', 10);
          return ya - yb;
        });
      case 'downloads':
        return results.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      default: // 'relevance' — keep original order from API
        return results;
    }
  }, [response.results, sortBy]);

  const totalPages = Math.ceil(response.total_results / response.rows);

  return (
    <div className="content">
      <div className="results-header">
        <div className="results-info">
          <h2 className="results-count">{response.total_results.toLocaleString()}</h2>
          <span className="results-query">results{query ? ` for "${query}"` : ''}</span>
        </div>
        <div className="results-actions">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <ListIcon />
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              <GridIcon />
            </button>
          </div>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="relevance">Relevance</option>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="downloads">Most downloaded</option>
          </select>
          <button className="select-all-btn" onClick={onSelectAll}>
            {selected.size === response.results.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="results-list">
          {sortedResults.map(book => (
            <BookCardList
              key={book.identifier}
              book={book}
              selected={selected.has(book.identifier)}
              onSelect={onToggleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="results-grid">
          {sortedResults.map(book => (
            <BookCardGrid
              key={book.identifier}
              book={book}
              selected={selected.has(book.identifier)}
              onSelect={onToggleSelect}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="results-header" style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--border-light)', borderBottom: 'none' }}>
          <button
            className="select-all-btn"
            disabled={response.page <= 1}
            onClick={() => onPageChange(response.page - 1)}
          >
            ← Previous
          </button>
          <span className="results-query">Page {response.page} of {totalPages}</span>
          <button
            className="select-all-btn"
            disabled={response.page >= totalPages}
            onClick={() => onPageChange(response.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

interface BookCardListProps {
  book: SearchResult;
  selected: boolean;
  onSelect: (id: string) => void;
}

function BookCardList({ book, selected, onSelect }: BookCardListProps) {
  const thumbnailUrl = `https://archive.org/services/img/${book.identifier}`;

  return (
    <div
      className={`book-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(book.identifier)}
    >
      <div
        className={`book-select ${selected ? 'selected' : ''}`}
        onClick={(e) => { e.stopPropagation(); onSelect(book.identifier); }}
      >
        <CheckIcon />
      </div>
      <img
        className="book-thumb"
        src={thumbnailUrl}
        alt=""
        onError={(e) => { (e.target as HTMLImageElement).style.background = '#e8e6e3'; }}
      />
      <div className="book-content">
        <h3 className="book-title">{book.title || book.identifier}</h3>
        {book.creator && <p className="book-creator">{book.creator}</p>}
        {book.description && <p className="book-description">{book.description}</p>}
        <div className="book-meta">
          {book.year && <span>{book.year}</span>}
          {book.language && <span>{book.language}</span>}
          {book.downloads && <span>{book.downloads.toLocaleString()} downloads</span>}
        </div>
        <div className="book-formats">
          <span className="format-badge">pdf</span>
          <span className="format-badge">epub</span>
          <span className="format-badge">djvu</span>
        </div>
      </div>
      <div className="book-actions">
        <div className="book-size">~50 MB</div>
        <a
          href={`https://archive.org/details/${book.identifier}`}
          target="_blank"
          rel="noopener noreferrer"
          className="book-link"
          onClick={(e) => e.stopPropagation()}
        >
          View <ExternalIcon />
        </a>
      </div>
    </div>
  );
}

interface BookCardGridProps {
  book: SearchResult;
  selected: boolean;
  onSelect: (id: string) => void;
}

function BookCardGrid({ book, selected, onSelect }: BookCardGridProps) {
  const thumbnailUrl = `https://archive.org/services/img/${book.identifier}`;

  return (
    <div
      className={`book-card-grid ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(book.identifier)}
    >
      <img
        className="book-thumb"
        src={thumbnailUrl}
        alt=""
        onError={(e) => { (e.target as HTMLImageElement).style.background = '#e8e6e3'; }}
      />
      <div className="book-header">
        <div>
          <h3 className="book-title" style={{ fontSize: '17px' }}>{book.title || book.identifier}</h3>
          {book.creator && <p className="book-creator">{book.creator}</p>}
        </div>
        <div
          className={`book-select ${selected ? 'selected' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSelect(book.identifier); }}
        >
          <CheckIcon />
        </div>
      </div>
      <div className="book-meta" style={{ marginTop: 'auto', paddingTop: '12px' }}>
        {book.year && <span>{book.year}</span>}
        <span>~50 MB</span>
      </div>
    </div>
  );
}
