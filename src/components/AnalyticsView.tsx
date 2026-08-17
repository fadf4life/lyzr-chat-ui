import type { Session } from '../types';

interface AnalyticsViewProps {
  sessions: Session[];
  firstUsedAt: number; // epoch milliseconds
}

interface Stats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  totalSessions: number;
  charactersWritten: number;
  daysActive: number;
}

function computeStats(sessions: Session[], firstUsedAt: number): Stats {
  let userMessages = 0;
  let assistantMessages = 0;
  let charactersWritten = 0;

  for (const session of sessions) {
    for (const message of session.messages) {
      if (message.sender === 'user') {
        userMessages += 1;
        charactersWritten += message.text.length;
      } else {
        assistantMessages += 1;
      }
    }
  }

  const daysActive = Math.max(
    1,
    Math.ceil((Date.now() - firstUsedAt) / (1000 * 60 * 60 * 24)),
  );

  return {
    totalMessages: userMessages + assistantMessages,
    userMessages,
    assistantMessages,
    totalSessions: sessions.length,
    charactersWritten,
    daysActive,
  };
}

export function AnalyticsView({ sessions, firstUsedAt }: AnalyticsViewProps) {
  const stats = computeStats(sessions, firstUsedAt);

  const cards = [
    { label: 'Sessions', value: stats.totalSessions },
    { label: 'Total messages', value: stats.totalMessages },
    { label: 'You asked', value: stats.userMessages },
    { label: 'Mentor replied', value: stats.assistantMessages },
    { label: 'Characters written', value: stats.charactersWritten.toLocaleString() },
    { label: 'Days active', value: stats.daysActive },
  ];

  const mentorRatio =
    stats.userMessages > 0 ? (stats.assistantMessages / stats.userMessages).toFixed(1) : '—';

  return (
    <section className="Panel">
      <header className="Panel__header">
        <h2>Analytics</h2>
        <p>A local snapshot of your journey with GenAI Mentor. Data never leaves this browser.</p>
      </header>

      <div className="StatGrid">
        {cards.map((card) => (
          <div key={card.label} className="StatCard">
            <div className="StatCard__value">{card.value}</div>
            <div className="StatCard__label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="StatInsight">
        <div className="StatInsight__title">Mentor response ratio</div>
        <p>
          {stats.userMessages === 0
            ? 'Start a conversation to build your stats.'
            : `You receive ${mentorRatio} mentor repl${stats.assistantMessages === 1 ? 'y' : 'ies'} for every message you send.`}
        </p>
        <p className="StatInsight__hint">
          First used {new Date(firstUsedAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </section>
  );
}
