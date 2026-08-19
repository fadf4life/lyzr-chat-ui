import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '../types';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (text: string) => void;
}

const SUGGESTIONS = [
  'What can you help me with?',
  'Teach me something new today',
  'Help me set a learning goal',
  'Quiz me on a topic',
];

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatView({ messages, isLoading, onSubmit }: ChatViewProps) {
  const [draft, setDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll inside the chat container only — scrollIntoView on an anchor
    // can drag every scrollable ancestor (including the page) along with it.
    const area = scrollAreaRef.current;
    if (area) {
      area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const send = () => {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft('');
    onSubmit(text);
    // Keep focus in the composer for fast follow-ups.
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const handleCopy = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopiedId(message.id);
      window.setTimeout(() => setCopiedId((current) => (current === message.id ? null : current)), 1600);
    } catch {
      // Clipboard unavailable (e.g. older browser) — ignore silently.
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <section className="ChatView">
      <div className="ChatView__scroll" ref={scrollAreaRef}>
        {!hasMessages ? (
          <div className="ChatView__welcome">
            <div className="ChatView__welcomeOrb" aria-hidden="true">GM</div>
            <h2>Welcome to GenAI Mentor</h2>
            <p>Your personal AI companion. Ask anything, or start with one of these:</p>
            <div className="ChatView__suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="ChatView__chip"
                  disabled={isLoading}
                  onClick={() => onSubmit(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ChatView__messages">
            {messages.map((message) => (
              <article key={message.id} className={`Message Message--${message.sender}`}>
                <div className="Message__body">
                  {message.sender === 'assistant' ? (
                    <div className="Message__text Markdown">
                      <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                    </div>
                  ) : (
                    <div className="Message__text">{message.text}</div>
                  )}
                </div>
                <footer className="Message__footer">
                  <span className="Message__time">{formatTime(message.timestamp)}</span>
                  {message.sender === 'assistant' && (
                    <button
                      type="button"
                      className="Message__copy"
                      onClick={() => handleCopy(message)}
                    >
                      {copiedId === message.id ? 'Copied ✓' : 'Copy'}
                    </button>
                  )}
                </footer>
              </article>
            ))}
            {isLoading && (
              <div className="Message Message--assistant Message--typing" aria-live="polite">
                <div className="TypingDots" aria-label="GenAI Mentor is thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        className="Composer"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <textarea
          ref={textareaRef}
          className="Composer__input"
          value={draft}
          rows={1}
          placeholder="Message GenAI Mentor… (Enter to send · Shift+Enter for a new line)"
          disabled={isLoading}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="Composer__send"
          disabled={isLoading || !draft.trim()}
          aria-label="Send message"
        >
          {isLoading ? '…' : 'Send'}
        </button>
      </form>
    </section>
  );
}
