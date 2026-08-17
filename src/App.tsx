import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Types
interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

// Lyzr API configuration
const LYZR_API = {
  url: 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
  apiKey: 'sk-default-oxJP2NVhizJeiowoZy4zGCzpjfX3TAEp',
  userId: 'amtuk119@gmail.com',
  agentId: '6a80a66a3cff96f7d1224f47',
  sessionId: '6a80a66a3cff96f7d1224f47-x7uti9kx',
};

// Extract assistant text from an unknown Lyzr response shape
function extractReply(data: unknown): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const key of ['response', 'message', 'output', 'answer', 'reply', 'text']) {
      const value = record[key];
      if (typeof value === 'string') return value;
      if (value && typeof value === 'object') {
        const nested = extractReply(value);
        if (nested) return nested;
      }
    }
  }
  return '';
}

const Header = () => (
  <header className="Header">
    <h1>GenAI Mentor</h1>
  </header>
);

const MessageList = ({ messages }: { messages: Message[] }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="MessageList">
      {messages.map((msg, index) => (
        <div key={index} className={`Message ${msg.sender}`}>
          <div className="author">{msg.sender}</div>
          <div>{msg.text}</div>
        </div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

const MessageInput = ({ onSendMessage, isLoading }: { onSendMessage: (text: string) => void, isLoading: boolean }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <form className="MessageInput" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message..."
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>SEND</button>
    </form>
  );
};

const Sidebar = () => (
  <div className="Sidebar">
    <h2>Features</h2>
    <ul>
      <li className="active">Chat</li>
      <li>History</li>
      <li>Settings</li>
      <li>Analytics</li>
    </ul>
    <div className="SidebarFooter">
      GenAI Mentor v1.0
    </div>
  </div>
);


function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Connected to GenAI Mentor. How can I assist you?", sender: 'assistant' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(LYZR_API.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LYZR_API.apiKey,
        },
        body: JSON.stringify({
          user_id: LYZR_API.userId,
          agent_id: LYZR_API.agentId,
          session_id: LYZR_API.sessionId,
          message: text,
        }),
      });

      const raw = await response.text();
      let reply = '';
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object' && typeof data.detail === 'string') {
          throw new Error(data.detail);
        }
        reply = extractReply(data);
      } catch (err) {
        if (err instanceof SyntaxError) {
          reply = raw;
        } else {
          throw err;
        }
      }

      if (!reply && !response.ok) {
        throw new Error(`GenAI Mentor returned an error (HTTP ${response.status}).`);
      }

      const assistantMessage: Message = {
        text: reply || 'GenAI Mentor returned an empty response. Please try again.',
        sender: 'assistant',
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: Message = {
        text: `GenAI Mentor encountered an issue: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        sender: 'assistant',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Layout">
      <Sidebar />
      <div className="App">
        <Header />
        <MessageList messages={messages} />
        {isLoading && <div className="loading-indicator">GenAI Mentor is thinking...</div>}
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

export default App;
