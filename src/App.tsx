import { useState, useCallback } from 'react';
import { SearchSidebar } from './components/SearchSidebar';
import { ResultsView } from './components/ResultsView';
import { QueuePage } from './components/QueuePage';
import { SettingsPage } from './components/SettingsPage';
import { SelectionPanel } from './components/SelectionPanel';
import { searchArchive, getItemDetails } from './lib/archive-api';
import type { SearchResponse } from './lib/archive-api';
import type { SearchFormData, QueueItem, AppSettings } from './types';
import { SearchIcon, CartIcon, SettingsIcon } from './components/Icons';
import './App.css';

type Page = 'search' | 'queue' | 'settings';

const DEFAULT_SETTINGS: AppSettings = {
  downloadFolder: '',
  preferredFormat: 'PDF',
};

function App() {
  const [page, setPage] = useState<Page>('search');
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchFormData | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState('relevance');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const handleSearch = useCallback(async (formData: SearchFormData, page = 1) => {
    setIsLoading(true);
    setLastSearchParams(formData);
    setLastQuery(formData.query || formData.title || formData.creator || '');

    try {
      const response = await searchArchive({
        query: formData.query || undefined,
        title: formData.title || undefined,
        creator: formData.creator || undefined,
        year_from: formData.yearFrom ? parseInt(formData.yearFrom) : undefined,
        year_to: formData.yearTo ? parseInt(formData.yearTo) : undefined,
        language: formData.language,
        search_mode: formData.searchMode,
        page,
        rows: 24,
      });
      setSearchResponse(response);
      setSelected(new Set());
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((pageNum: number) => {
    if (lastSearchParams) {
      handleSearch(lastSearchParams, pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lastSearchParams, handleSearch]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!searchResponse) return;
    setSelected(prev =>
      prev.size === searchResponse.results.length
        ? new Set()
        : new Set(searchResponse.results.map(r => r.identifier))
    );
  }, [searchResponse]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const addToQueue = useCallback(() => {
    if (!searchResponse) return;
    const selectedResults = searchResponse.results.filter(r => selected.has(r.identifier));
    const newItems = selectedResults.filter(r => !queue.find(q => q.identifier === r.identifier));

    setQueue(prev => [
      ...prev,
      ...newItems.map(item => ({
        ...item,
        selectedFormat: settings.preferredFormat.toLowerCase(),
        formats: ['pdf', 'epub', 'djvu', 'txt'],
        size: '~50 MB',
      }))
    ]);
    setSelected(new Set());
  }, [selected, searchResponse, queue, settings.preferredFormat]);

  const updateQueueFormat = useCallback((id: string, format: string) => {
    setQueue(prev => prev.map(item =>
      item.identifier === id ? { ...item, selectedFormat: format } : item
    ));
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.identifier !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const handleDownload = useCallback(async () => {
    if (queue.length === 0) return;

    // Fetch actual file URLs from Archive.org metadata and download
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        const details = await getItemDetails(item.identifier);
        const formatLower = item.selectedFormat.toLowerCase();

        // Find matching file by format
        const file = details.files.find(f =>
          f.format.toLowerCase().includes(formatLower) ||
          f.name.toLowerCase().endsWith(`.${formatLower}`)
        );

        if (file) {
          // Small delay between downloads to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, i * 300));
          window.open(file.download_url, '_blank');
        } else {
          console.warn(`No ${item.selectedFormat} file found for ${item.identifier}`);
        }
      } catch (error) {
        console.error(`Failed to get details for ${item.identifier}:`, error);
      }
    }
  }, [queue]);

  const exportList = useCallback(async () => {
    // Generate direct download URLs for wget/curl/ia CLI
    const urls: string[] = [];

    for (const item of queue) {
      try {
        const details = await getItemDetails(item.identifier);
        const formatLower = item.selectedFormat.toLowerCase();
        const file = details.files.find(f =>
          f.format.toLowerCase().includes(formatLower) ||
          f.name.toLowerCase().endsWith(`.${formatLower}`)
        );
        if (file) {
          urls.push(file.download_url);
        }
      } catch (error) {
        console.error(`Failed to get URL for ${item.identifier}:`, error);
      }
    }

    if (urls.length > 0) {
      navigator.clipboard?.writeText(urls.join('\n'));
      alert(`${urls.length} URLs copied to clipboard!`);
    } else {
      alert('No valid URLs found');
    }
  }, [queue]);

  return (
    <div className="app">
      <header className="header">
        <div className="logo" onClick={() => setPage('search')}>
          <span className="logo-mark">Archive</span>
          <span className="logo-tag">Search & Download</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${page === 'search' ? 'active' : ''}`}
            onClick={() => setPage('search')}
          >
            <SearchIcon /> Search
          </button>
          <button
            className={`nav-btn ${page === 'queue' ? 'active' : ''}`}
            onClick={() => setPage('queue')}
          >
            <CartIcon /> Queue
            {queue.length > 0 && <span className="badge">{queue.length}</span>}
          </button>
          <button
            className={`nav-btn ${page === 'settings' ? 'active' : ''}`}
            onClick={() => setPage('settings')}
          >
            <SettingsIcon /> Settings
          </button>
        </nav>
      </header>

      {page === 'search' && (
        <>
          <main className="main">
            <SearchSidebar onSearch={handleSearch} isLoading={isLoading} />
            <ResultsView
              response={searchResponse}
              isLoading={isLoading}
              query={lastQuery}
              selected={selected}
              viewMode={viewMode}
              sortBy={sortBy}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              onViewModeChange={setViewMode}
              onSortChange={setSortBy}
              onPageChange={handlePageChange}
            />
          </main>
          <SelectionPanel
            count={selected.size}
            onClear={clearSelection}
            onAddToQueue={addToQueue}
          />
        </>
      )}

      {page === 'queue' && (
        <QueuePage
          queue={queue}
          onFormatChange={updateQueueFormat}
          onRemove={removeFromQueue}
          onClear={clearQueue}
          onDownload={handleDownload}
          onExport={exportList}
          onNavigate={setPage}
        />
      )}

      {page === 'settings' && (
        <SettingsPage
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}
    </div>
  );
}

export default App;
