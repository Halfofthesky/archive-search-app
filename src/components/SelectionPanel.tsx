import { CartIcon } from './Icons';

interface SelectionPanelProps {
  count: number;
  onClear: () => void;
  onAddToQueue: () => void;
}

export function SelectionPanel({ count, onClear, onAddToQueue }: SelectionPanelProps) {
  return (
    <div className={`download-panel ${count > 0 ? 'visible' : ''}`}>
      <div className="panel-info">
        <span className="panel-count">
          <strong>{count}</strong> {count === 1 ? 'book' : 'books'} selected
        </span>
      </div>
      <div className="panel-actions">
        <button className="panel-btn secondary" onClick={onClear}>
          Clear
        </button>
        <button className="panel-btn primary" onClick={onAddToQueue}>
          <CartIcon /> Add to queue
        </button>
      </div>
    </div>
  );
}
