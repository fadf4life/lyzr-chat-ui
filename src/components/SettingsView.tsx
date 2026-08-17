import { useState } from 'react';
import type { FontScale, Settings, Theme } from '../types';

interface SettingsViewProps {
  settings: Settings;
  onChangeSettings: (patch: Partial<Settings>) => void;
  onClearData: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Cyber Dark' },
  { value: 'light', label: 'Holo Light' },
];

const SCALE_OPTIONS: { value: FontScale; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

export function SettingsView({ settings, onChangeSettings, onClearData }: SettingsViewProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <section className="Panel">
      <header className="Panel__header">
        <h2>Settings</h2>
        <p>Personalize your GenAI Mentor interface. Preferences are saved to this browser.</p>
      </header>

      <div className="SettingsGroup">
        <h3 className="SettingsGroup__label">Theme</h3>
        <div className="SettingsGroup__options">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`SettingsOption${settings.theme === option.value ? ' is-selected' : ''}`}
              onClick={() => onChangeSettings({ theme: option.value })}
            >
              <span className="SettingsOption__swatch" data-swatch={option.value} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="SettingsGroup">
        <h3 className="SettingsGroup__label">Text density</h3>
        <div className="SettingsGroup__options">
          {SCALE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`SettingsOption${settings.fontScale === option.value ? ' is-selected' : ''}`}
              onClick={() => onChangeSettings({ fontScale: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="SettingsGroup SettingsGroup--danger">
        <h3 className="SettingsGroup__label">Danger zone</h3>
        <p className="SettingsGroup__hint">
          Permanently removes every saved conversation and preference from this browser.
        </p>
        {confirmingClear ? (
          <div className="SettingsGroup__confirm">
            <span>Are you sure? This cannot be undone.</span>
            <button
              type="button"
              className="DangerButton"
              onClick={() => {
                onClearData();
                setConfirmingClear(false);
              }}
            >
              Yes, clear everything
            </button>
            <button
              type="button"
              className="GhostButton"
              onClick={() => setConfirmingClear(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="DangerButton" onClick={() => setConfirmingClear(true)}>
            Clear all data
          </button>
        )}
      </div>
    </section>
  );
}
