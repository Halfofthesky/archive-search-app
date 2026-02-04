import { useMemo } from 'react';
import type { QueueItem } from '../types';
import { BookIcon, DownloadIcon, FileIcon, TrashIcon } from './Icons';

interface QueuePageProps {
  queue: QueueItem[];
  onFormatChange: (id: string, format: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onDownload: () => void;
  onExport: () => void;
  onNavigate: (page: 'search' | 'queue') => void;
}

export function QueuePage({
  queue,
  onFormatChange,
  onRemove,
  onClear,
  onDownload,
  onExport,
  onNavigate,
}: QueuePageProps) {
  const totalSize = useMemo(() => {
    // Estimate ~50MB per item for now
    const totalMB = queue.length * 50;
    return totalMB >= 1000 ? `${(totalMB / 1000).toFixed(1)} GB` : `${totalMB} MB`;
  }, [queue]);

  if (queue.length === 0) {
    return (
      <div className="queue-page">
        <div className="queue-header">
          <h1 className="queue-title">Download Queue</h1>
          <p className="queue-subtitle">Review and download your selected books</p>
        </div>
        <div className="queue-empty">
          <BookIcon />
          <h2 className="empty-title">Queue is empty</h2>
          <p className="empty-text">Search and select books to add them here</p>
          <button
            className="search-btn"
            style={{ width: 'auto', marginTop: '24px' }}
            onClick={() => onNavigate('search')}
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="queue-page">
      <div className="queue-header">
        <h1 className="queue-title">Download Queue</h1>
        <p className="queue-subtitle">Review and download your selected books</p>
      </div>

      <div className="queue-controls">
        <div className="queue-stats">
          <div className="queue-stat">
            <span className="queue-stat-value">{queue.length}</span>
            <span className="queue-stat-label">items</span>
          </div>
          <div className="queue-stat">
            <span className="queue-stat-value">{totalSize}</span>
            <span className="queue-stat-label">total</span>
          </div>
        </div>
        <button className="panel-btn secondary" onClick={onClear}>
          Clear all
        </button>
      </div>

      <div className="queue-list">
        {queue.map(item => (
          <QueueItemCard
            key={item.identifier}
            item={item}
            onFormatChange={onFormatChange}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="queue-summary">
        <div className="queue-summary-row">
          <span className="queue-summary-label">Items</span>
          <span className="queue-summary-value">{queue.length} books</span>
        </div>
        <div className="queue-summary-row">
          <span className="queue-summary-label">Estimated size</span>
          <span className="queue-summary-value">{totalSize}</span>
        </div>
        <div className="queue-summary-row">
          <span className="queue-summary-label">Total</span>
          <span className="queue-summary-value queue-summary-total">{queue.length} files</span>
        </div>
        <button className="queue-download-btn" onClick={onDownload}>
          <DownloadIcon /> Download all
        </button>
        <button className="queue-export-btn" onClick={onExport}>
          <FileIcon /> Export URL list (for wget / ia CLI)
        </button>
      </div>
    </div>
  );
}

interface QueueItemCardProps {
  item: QueueItem;
  onFormatChange: (id: string, format: string) => void;
  onRemove: (id: string) => void;
}

function QueueItemCard({ item, onFormatChange, onRemove }: QueueItemCardProps) {
  const thumbnailUrl = `https://archive.org/services/img/${item.identifier}`;

  return (
    <div className="queue-item">
      <img
        className="queue-item-thumb"
        src={thumbnailUrl}
        alt=""
        onError={(e) => { (e.target as HTMLImageElement).style.background = '#e8e6e3'; }}
      />
      <div className="queue-item-content">
        <h3 className="queue-item-title">{item.title || item.identifier}</h3>
        <p className="queue-item-meta">
          {item.creator && `${item.creator} · `}{item.year}
        </p>
      </div>
      <select
        className="format-select-small"
        value={item.selectedFormat}
        onChange={(e) => onFormatChange(item.identifier, e.target.value)}
      >
        {item.formats.map(fmt => (
          <option key={fmt} value={fmt}>{fmt}</option>
        ))}
      </select>
      <div className="queue-item-size">{item.size}</div>
      <button
        className="queue-item-remove"
        onClick={() => onRemove(item.identifier)}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
