import type { ViewId } from '../types';

interface SidebarProps {
  view: ViewId;
  activeSessionId: string | null;
  sessionCount: number;
  onSelectView: (view: ViewId) => void;
  onNewChat: () => void;
}

const NAV_ITEMS: { id: ViewId; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat', icon: '◆' },
  { id: 'history', label: 'History', icon: '▤' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'analytics', label: 'Analytics', icon: '◔' },
];

export function Sidebar({ view, activeSessionId, sessionCount, onSelectView, onNewChat }: SidebarProps) {
  return (
    <aside className="Sidebar">
      <div className="Sidebar__brand">
        <div className="Sidebar__logo">GM</div>
        <div className="Sidebar__title">
          <h1>GenAI Mentor</h1>
          <span className="Sidebar__subtitle">Neural Interface v2.0</span>
        </div>
      </div>

      <button type="button" className="Sidebar__newChat" onClick={onNewChat}>
        + New Chat
      </button>

      <nav className="Sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`Sidebar__navItem${view === item.id ? ' is-active' : ''}`}
            onClick={() => onSelectView(item.id)}
          >
            <span className="Sidebar__navIcon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="Sidebar__footer">
        <div className="Sidebar__status">
          <span className="Sidebar__statusDot" aria-hidden="true" />
          System online
        </div>
        <div className="Sidebar__meta">
          {sessionCount} session{sessionCount === 1 ? '' : 's'} stored locally
          {activeSessionId ? ' · this device only' : ''}
        </div>
      </div>
    </aside>
  );
}
