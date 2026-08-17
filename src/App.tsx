import { useEffect, useState } from 'react';
import './App.css';
import { sendChatMessage } from './api';
import { AnalyticsView } from './components/AnalyticsView';
import { ChatView } from './components/ChatView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { clearPersisted, defaultState, generateId, loadPersisted, persist } from './storage';
import type { Message, Sender, Session, Settings, ViewId } from './types';

const SESSION_TITLE_MAX = 48;

function deriveTitle(text: string): string {
  const compact = text.trim().replace(/\s+/g, ' ');
  return compact.length > SESSION_TITLE_MAX
    ? `${compact.slice(0, SESSION_TITLE_MAX - 1)}…`
    : compact;
}

function upsertSession(
  sessions: Session[],
  sessionId: string,
  message: Message,
  fallbackTitle: string,
): Session[] {
  const existing = sessions.find((session) => session.id === sessionId);
  if (existing) {
    return sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            updatedAt: message.timestamp,
            messages: [...session.messages, message],
          }
        : session,
    );
  }
  const created: Session = {
    id: sessionId,
    title: fallbackTitle,
    createdAt: message.timestamp,
    updatedAt: message.timestamp,
    messages: [message],
  };
  return [created, ...sessions];
}

function App() {
  const [persisted, setPersisted] = useState(loadPersisted);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [view, setView] = useState<ViewId>('chat');
  const [isLoading, setIsLoading] = useState(false);

  // Persist every state change; reflect preferences on the root element.
  useEffect(() => {
    persist(persisted);
  }, [persisted]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = persisted.settings.theme;
    root.dataset.fontScale = persisted.settings.fontScale;
  }, [persisted.settings]);

  const activeSession = persisted.sessions.find((session) => session.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  const startNewChat = () => {
    setActiveSessionId(null);
    setView('chat');
  };

  const openSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setView('chat');
  };

  const deleteSession = (sessionId: string) => {
    setPersisted((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
    }));
    if (activeSessionId === sessionId) setActiveSessionId(null);
  };

  const changeSettings = (patch: Partial<Settings>) => {
    setPersisted((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  };

  const clearAllData = () => {
    clearPersisted();
    setPersisted(defaultState());
    setActiveSessionId(null);
    setView('chat');
  };

  const addMessage = (sessionId: string, text: string, sender: Sender): void => {
    const message: Message = {
      id: generateId(),
      text,
      sender,
      timestamp: Date.now(),
    };
    setPersisted((current) => ({
      ...current,
      sessions: upsertSession(current.sessions, sessionId, message, deriveTitle(text)),
    }));
  };

  const sendMessage = async (text: string) => {
    if (isLoading) return;
    const sessionId = activeSessionId ?? generateId();
    setActiveSessionId(sessionId);
    setIsLoading(true);

    addMessage(sessionId, text, 'user');

    try {
      const reply = await sendChatMessage(text);
      addMessage(sessionId, reply, 'assistant');
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error';
      addMessage(sessionId, `GenAI Mentor encountered an issue: ${reason}. Please try again.`, 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Layout">
      <div className="BackgroundFx" aria-hidden="true">
        <div className="BackgroundFx__grid" />
        <div className="BackgroundFx__orb BackgroundFx__orb--a" />
        <div className="BackgroundFx__orb BackgroundFx__orb--b" />
      </div>

      <Sidebar
        view={view}
        activeSessionId={activeSessionId}
        sessionCount={persisted.sessions.length}
        onSelectView={setView}
        onNewChat={startNewChat}
      />

      <main className="Stage">
        {view === 'chat' && (
          <ChatView messages={messages} isLoading={isLoading} onSubmit={sendMessage} />
        )}
        {view === 'history' && (
          <HistoryView
            sessions={persisted.sessions}
            activeSessionId={activeSessionId}
            currentSessionId={activeSessionId}
            onOpenSession={openSession}
            onDeleteSession={deleteSession}
          />
        )}
        {view === 'settings' && (
          <SettingsView
            settings={persisted.settings}
            onChangeSettings={changeSettings}
            onClearData={clearAllData}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsView sessions={persisted.sessions} firstUsedAt={persisted.firstUsedAt} />
        )}
      </main>
    </div>
  );
}

export default App;
