import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Types
interface Message {
  text: string;
  sender: 'user' | 'assistant';
}

// API Configuration
const API_URL = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';
const API_KEY = 'sk-default-oxJP2NVhizJeiowoZy4zGCzpjfX3TAEp';
const USER_ID = 'amtuk119@gmail.com';
const AGENT_ID = '6a80a66a3cff96f7d1224f47';
const SESSION_ID = '6a80a66a3cff96f7d1224f47-zi12lvef';


const Header = () => (
  <header className="Header">
    <h1>Lyzr Chat</h1>
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

const MessageInput = ({ onSendMessage }: { onSendMessage: (text: string) => void }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
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
      />
      <button type="submit">SEND</button>
    </form>
  );
};

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Connected to Lyzr-Core. How can I assist you?", sender: 'assistant' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          user_id: USER_ID,
          agent_id: AGENT_ID,
          session_id: SESSION_ID,
          message: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      // The API response for this endpoint is just the assistant's message string directly.
      const data = await response.json();

      let assistantMessageText = "I am unable to respond at the moment.";
      // Based on the curl, the response is not a JSON object but a raw string.
      // We need to handle that. Let's assume the happy path gives a JSON with a 'message' field
      // as good practice, but handle the raw string case.
      if (typeof data === 'string') {
        assistantMessageText = data;
      } else if (data && data.message) {
        assistantMessageText = data.message;
      }

      const assistantMessage: Message = { text: assistantMessageText, sender: 'assistant' };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { text: "Error connecting to the Lyzr-Core. Please try again.", sender: 'assistant' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="App">
      <Header />
      <MessageList messages={messages} />
      {isLoading && <div style={{textAlign: 'center', padding: '1rem', color: 'var(--color-accent)'}}>Lyzr-Core is thinking...</div>}
      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
}

export default App;
