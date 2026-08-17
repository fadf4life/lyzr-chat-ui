import type { Session } from '../types';

interface HistoryViewProps {
  sessions: Session[];
  activeSessionId: string | null;
  currentSessionId: string | null; // in-progress session that may not be saved yet
  onOpenSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryView({
  sessions,
  activeSessionId,
  currentSessionId,
  onOpenSession,
  onDeleteSession,
}: HistoryViewProps) {
  return (
    <section className="Panel">
      <header className="Panel__header">
        <h2>History</h2>
        <p>Conversations stored locally in your browser. Click one to continue.</p>
      </header>

      {sessions.length === 0 ? (
        <div className="Panel__empty">
          <p>No saved sessions yet.</p>
          <p className="Panel__emptyHint">Start chatting — your conversations will appear here automatically.</p>
        </div>
      ) : (
        <div className="HistoryList">
          {sessions.map((session) => {
            const isActive = session.id === activeSessionId || session.id === currentSessionId;
            return (
              <article key={session.id} className={`HistoryCard${isActive ? ' is-active' : ''}`}>
                <button
                  type="button"
                  className="HistoryCard__open"
                  onClick={() => onOpenSession(session.id)}
                >
                  <div className="HistoryCard__title">{session.title}</div>
                  <div className="HistoryCard__meta">
                    {session.messages.length} message{session.messages.length === 1 ? '' : 's'}
                    {' · '}last activity {formatDateTime(session.updatedAt)}
                    {isActive ? ' · current' : ''}
                  </div>
                </button>
                <button
                  type="button"
                  className="HistoryCard__delete"
                  aria-label={`Delete session "${session.title}"`}
                  onClick={() => onDeleteSession(session.id)}
                >
                  ✕
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
