import React, { useState, useRef, useEffect } from 'react';
import { HISTORY_DATA, SUGGESTED } from '../../data/legacyData';
import './ExplorePage.css';

const ExplorePage = ({ user }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: "Hello! I'm the Governance AI Assistant, trained on all the resources in this hub. How can I help with your research today?" }
  ]);
  const [input, setInput] = useState("");
  const [history] = useState(HISTORY_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSend = (text = null) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput("");
    setTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setTyping(false);
      const aiMsg = { 
        id: Date.now() + 1, 
        role: 'assistant', 
        text: `Based on my analysis of the hub's resources regarding "${msgText.substring(0, 30)}...", there are several key frameworks to consider. In the Public Financial Management Handbook (2023), accountability is prioritized through TSA systems. Would you like me to extract the specific regulatory requirements?` 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="explore-layout">
      {isSidebarOpen && (
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <span className="sidebar-logo">◆ GOVHUB AI</span>
            <button className="new-chat-btn" onClick={() => setMessages([messages[0]])}>+ New Chat</button>
          </div>
          <div className="chat-history">
            <div className="history-group-label">RECENT RESEARCH</div>
            {history.map(item => (
              <button key={item.id} className="history-item">
                <span className="history-icon">💬</span>
                <div className="history-info">
                  <span className="history-title">{item.title}</span>
                  <span className="history-date">{item.date}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <div className="powered-by">
              <span>POWERED BY</span>
              <span className="powered-name">GovAI-Core v2.4</span>
            </div>
            <p className="sidebar-note">Analysis based on {user ? user.name : 'Guest'}'s research library access level.</p>
          </div>
        </aside>
      )}

      <div className="chat-area">
        <div className="chat-topbar">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '⇠' : '⇢'} UI
          </button>
          <div className="chat-title">
            <h2>Research Assistant</h2>
            <div className="online-dot" />
            <span>AI Online</span>
          </div>
        </div>

        <div className="messages-area">
          {messages.length === 1 && (
            <div className="suggestions-area">
              <div className="suggestions-label">Explore common research topics:</div>
              <div className="suggestions-grid">
                {SUGGESTED.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              <div className={`avatar ${msg.role === 'assistant' ? 'assistant-avatar' : 'user-avatar'}`}>
                {msg.role === 'assistant' ? '◆' : (user ? user.name[0] : 'U')}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                <div className="message-content">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="message-row assistant">
              <div className="avatar assistant-avatar">◆</div>
              <div className="message-bubble assistant">
                <div className="typing-dots">
                  <span /> <span /> <span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="input-wrapper">
            <textarea 
              className="chat-input"
              rows="1"
              placeholder="Ask anything about governance, PFM, or integrity..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim()}>
              ↑
            </button>
          </div>
          <p className="input-hint">AI may generate inaccurate information. Cross-reference with hub source documents.</p>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
