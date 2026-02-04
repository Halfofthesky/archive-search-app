import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';

// Check if running in Tauri
const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

interface SettingsPageProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

const FORMAT_OPTIONS = [
  { value: 'PDF', label: 'PDF' },
  { value: 'EPUB', label: 'EPUB' },
  { value: 'DjVu', label: 'DjVu' },
  { value: 'MOBI', label: 'MOBI' },
];

export function SettingsPage({ settings, onSettingsChange }: SettingsPageProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleDownloadFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSettings = { ...localSettings, downloadFolder: e.target.value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSettings = { ...localSettings, preferredFormat: e.target.value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleBrowseFolder = async () => {
    if (isTauri()) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Select Download Folder',
        });
        if (selected && typeof selected === 'string') {
          const newSettings = { ...localSettings, downloadFolder: selected };
          setLocalSettings(newSettings);
          onSettingsChange(newSettings);
        }
      } catch (err) {
        console.error('Failed to open folder picker:', err);
        alert('Failed to open folder picker. Please enter the path manually.');
      }
    } else {
      alert('Folder picker is only available in the desktop app. Please enter the path manually.');
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Configure your download preferences</p>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Downloads</h2>

        <div className="settings-field">
          <label className="settings-label">Download Folder</label>
          <p className="settings-description">
            Choose where downloaded files will be saved
          </p>
          <div className="settings-input-row">
            <input
              type="text"
              className="settings-input"
              value={localSettings.downloadFolder}
              onChange={handleDownloadFolderChange}
              placeholder="e.g., C:\Users\Downloads\Archive"
            />
            <button
              type="button"
              className="settings-browse-btn"
              onClick={handleBrowseFolder}
            >
              Browse...
            </button>
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Preferred Format</label>
          <p className="settings-description">
            Default format when adding items to the download queue
          </p>
          <select
            className="settings-select"
            value={localSettings.preferredFormat}
            onChange={handleFormatChange}
          >
            {FORMAT_OPTIONS.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
