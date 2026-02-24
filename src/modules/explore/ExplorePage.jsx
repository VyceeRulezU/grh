import React, { useState, useRef, useEffect } from 'react';
import './ExplorePage.css';
import Button from '../../components/ui/Button';

const ExplorePage = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: "Hello! I'm your Governance Assistant. How can I help you explore our research database today?" }
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { id: 1, title: "Public Finance Reform", date: "Today" },
    { id: 2, title: "Anti-Corruption Scoping", date: "Yesterday" },
    { id: 3, title: "Decentralisation Policy", date: "2 days ago" },
    { id: 4, title: "WGI Benchmarking 2024", date: "1 week ago" },
    { id: 5, title: "Local Gov Accountability", date: "1 week ago" },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        text: `That's an interesting question about ${input.substring(0, 20)}... Based on our Governance Hub documents, you might want to look at the 'PFM Guidelines 2024' or the 'Integrity Systems Framework'. Would you like me to summarize those for you?` 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="explore-container">
      {/* Sidebar - History */}
      <aside className="explore-sidebar">
        <div className="sidebar-new-chat">
          <Button variant="outline" fullWidth onClick={() => setMessages([messages[0]])}>+ New Chat</Button>
        </div>
        <div className="sidebar-history">
          <div className="history-label">Recent Searches</div>
          {history.map(item => (
            <button key={item.id} className="history-item">
              <span className="history-icon">💬</span>
              <span className="history-title">{item.title}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <img src="/c:/Users/USER/.gemini/antigravity/artifacts/representative_avatar_2.png" alt="User" className="avatar-sm" />
            <span>Governance Learner</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="explore-main">
        <div className="chat-messages">
          {messages.length === 1 && (
            <div className="chat-empty animate-in">
              <div className="explore-logo-v2">◆</div>
              <h1>How can I help you today?</h1>
              <div className="suggested-grid">
                {[
                  "What are the principles of good governance?",
                  "Explain PFM reform strategies",
                  "Compare decentralisation models in Africa",
                  "Summarize the 2023 Integrity Report"
                ].map(s => (
                  <button key={s} className="suggested-card" onClick={() => setInput(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className={`messages-list ${messages.length > 1 ? 'has-content' : ''}`}>
            {messages.length > 1 && messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.role}`}>
                <div className="message-content">
                  <div className="message-avatar">
                    {msg.role === 'assistant' ? (
                        <div className="ai-token-v2">◆</div>
                    ) : (
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="U" className="user-chat-avatar" />
                    )}
                  </div>
                  <div className="message-text">
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-area">
          <div className="input-container glass subtle-shadow">
            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Governance Hub Assistant..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
              ↑
            </button>
          </div>
          <p className="chat-disclaimer">Assistant may provide insights based on Hub resources. Verify important information.</p>
        </div>
      </main>
    </div>
  );
};

export default ExplorePage;
