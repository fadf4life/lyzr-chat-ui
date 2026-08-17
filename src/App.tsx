import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Types
interface Message {
  text: string;
  sender: 'user' | 'assistant';
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

    // MOCKED API RESPONSE
    setTimeout(() => {
      const assistantMessage: Message = { text: `This is a mocked response to: "${text}"`, sender: 'assistant' };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
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
