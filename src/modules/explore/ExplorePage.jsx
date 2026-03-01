import React, { useState, useRef, useEffect } from 'react';
import { HISTORY_DATA, SUGGESTED } from '../../data/legacyData';
import './ExplorePage.css';

// ---------------------------------------------------------------------------
// Dummy AI responses (used when VITE_OPENAI_API_KEY is not set)
// ---------------------------------------------------------------------------
const DUMMY_RESPONSES = [
  "Based on the hub's resources, good governance rests on **accountability, transparency, rule of law, participation, and effectiveness**. The World Bank Governance Indicators framework breaks these into six measurable dimensions. Would you like me to expand on any specific one?",
  "The PEFA framework (Public Expenditure & Financial Accountability) uses 31 performance indicators across seven pillars to assess PFM system quality. Nigeria's 2021 PEFA score highlighted challenges in budget credibility and external audit follow-up. Would you like a detailed breakdown?",
  "UNCAC (UN Convention Against Corruption) — ratified by 190 countries — establishes four pillars: **prevention, criminalisation, international cooperation, and asset recovery**. Chapter II is particularly relevant for preventive measures in public institutions.",
  "Electoral system design directly affects political representation. Proportional representation (PR) tends to increase minority and women's representation, while single-member plurality systems concentrate power. The IDEA Electoral System Design Handbook offers 33 country case studies.",
  "The Open Government Partnership (OGP), founded in 2011, now has 75 member countries. Members commit to biennial National Action Plans on transparency, civic participation, and accountability. Key tools include proactive disclosure, open contracting data standards, and citizen feedback portals.",
  "Strengthening legislative oversight requires: (1) well-resourced committee systems, (2) access to independent fiscal analysis (e.g., Parliamentary Budget Offices), (3) timely submission of audited accounts, and (4) robust PAC (Public Accounts Committee) follow-up mechanisms.",
];

let dummyIndex = 0;
const getDummyResponse = () => {
  const response = DUMMY_RESPONSES[dummyIndex % DUMMY_RESPONSES.length];
  dummyIndex++;
  return response;
};

// ---------------------------------------------------------------------------
// Dummy history conversations
// ---------------------------------------------------------------------------
const HISTORY_CONVERSATIONS = {
  1: [
    { id: 'h1-1', role: 'user', text: 'What are PFM reform strategies?' },
    { id: 'h1-2', role: 'assistant', text: 'PFM reform strategies typically follow a sequencing approach: first stabilise the basics (treasury single account, IFMIS), then build performance — results-oriented budgeting, medium-term expenditure frameworks, and citizen-facing fiscal transparency portals.' },
  ],
  2: [
    { id: 'h2-1', role: 'user', text: 'Compare electoral systems across regions.' },
    { id: 'h2-2', role: 'assistant', text: 'West Africa predominantly uses two-round majoritarian systems (e.g., Ghana, Senegal), while Southern Africa leans proportional representation (South Africa, Namibia). Mixed-member proportional systems appear in Lesotho and the proposed reforms in Kenya.' },
  ],
  3: [
    { id: 'h3-1', role: 'user', text: 'Summarise key anti-corruption frameworks.' },
    { id: 'h3-2', role: 'assistant', text: 'The three most influential frameworks are UNCAC (global treaty, asset recovery), T-I\'s National Integrity System (institutional mapping), and the OECD Anti-Bribery Convention (private sector focus). Each has distinct enforcement mechanisms.' },
  ],
  4: [
    { id: 'h4-1', role: 'user', text: 'What are open government initiatives?' },
    { id: 'h4-2', role: 'assistant', text: 'Key open government initiatives include the Open Government Partnership (75 countries), Open Contracting Data Standard (OCDS), EITI for extractives, and Budget Transparency Portals like the Open Budget Survey\'s national portal implementations.' },
  ],
};

// ---------------------------------------------------------------------------
// OpenAI API call (or fallback to dummy)
// ---------------------------------------------------------------------------
const getAIResponse = async (userText) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (apiKey && apiKey !== 'sk-your-key-here') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are the Governance AI Assistant for the Governance Resource Hub (GRH). You are trained on governance, public financial management, anti-corruption, electoral systems, and open government resources. Be concise, evidence-based, and cite frameworks or documents where relevant.' },
            { role: 'user', content: userText },
          ],
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || getDummyResponse();
    } catch {
      return getDummyResponse();
    }
  }

  return getDummyResponse();
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const INITIAL_MESSAGE = { id: 1, role: 'assistant', text: "Hello! I'm the Governance AI Assistant, trained on all the resources in this hub. How can I help with your research today?" };

const ExplorePage = ({ user, onNavigate }) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [history] = useState(HISTORY_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Close sidebar overlay on mobile when clicking outside
  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const startNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setActiveHistoryId(null);
    setInput('');
    // Close sidebar on mobile after action
    if (window.innerWidth <= 900) setIsSidebarOpen(false);
  };

  const loadHistory = (item) => {
    const conversation = HISTORY_CONVERSATIONS[item.id];
    if (conversation) {
      setMessages([INITIAL_MESSAGE, ...conversation]);
    }
    setActiveHistoryId(item.id);
    if (window.innerWidth <= 900) setIsSidebarOpen(false);
  };

  const handleSend = async (text = null) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setTyping(true);

    const responseText = await getAIResponse(msgText);
    setTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: responseText }]);
  };

  return (
    <div className="explore-layout">
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={handleOverlayClick} />}

      <aside className={`chat-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src="/assets/images/Logo/GRH-icon.png" alt="GRH" className="sidebar-icon-logo" />
            {/* <span className="sidebar-logo">GovHub AI</span> */}
          </div>
          <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>
        </div>

        <div className="chat-history">
          <div className="history-group-label">RECENT RESEARCH</div>
          {history.map(item => (
            <button
              key={item.id}
              className={`history-item ${activeHistoryId === item.id ? 'active' : ''}`}
              onClick={() => loadHistory(item)}
            >
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
          <p className="sidebar-note">
            Analysis based on {user ? user.name : 'Guest'}'s research library access level.
          </p>
        </div>
      </aside>

      <div className="chat-area">
        <div className="chat-topbar">
          <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <span className="material-symbols-outlined">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
          </button>

          <div className="chat-title">
            <h2>Research Assistant</h2>
            <div className="online-dot" />
            <span>AI Online</span>
          </div>

          {/* Back to website — subtle, right-aligned */}
          <button className="back-home-btn" onClick={() => onNavigate('welcome')}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="back-home-text">Back to Website</span>
          </button>
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
                {msg.role === 'assistant' ? '◆' : (user ? user.name?.[0]?.toUpperCase() : 'U')}
              </div>
              <div className={`message-bubble ${msg.role}`}>
                <div className="message-content">{msg.text}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="message-row assistant">
              <div className="avatar assistant-avatar">◆</div>
              <div className="message-bubble assistant">
                <div className="typing-dots">
                  <span /><span /><span />
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
