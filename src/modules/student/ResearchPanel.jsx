import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase/supabaseClient';

// ---------------------------------------------------------------------------
// Dummy AI responses (Fallback)
// ---------------------------------------------------------------------------
const DUMMY_RESPONSES = [
  "Based on the hub's resources, good governance rests on **accountability, transparency, rule of law, participation, and effectiveness**.",
  "The PEFA framework uses 31 performance indicators to assess PFM systems. Nigeria's 2021 score highlighted budget credibility challenges.",
  "UNCAC establishes four pillars: prevention, criminalisation, international cooperation, and asset recovery.",
  "Legislative oversight requires well-resourced committee systems and access to independent fiscal analysis."
];

let dummyIndex = 0;

const PROMPT_LIMIT = 20;

const ResearchPanel = ({ user }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: "Hello! I'm your AI Research Assistant. I can help you find insights across our entire library. What are you researching today?" }
  ]);
  const [input, setInput] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const [selectedSessions, setSelectedSessions] = useState(new Set());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    fetchSessions();
    fetchUsage();
  }, [user]);

  const fetchSessions = async () => {
    const { data } = await supabase.from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setSessions(data);
  };

  const fetchUsage = async () => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const { count } = await supabase.from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user')
      .gte('created_at', startOfMonth.toISOString());
    if (count !== null) setPromptsUsed(count);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages, typing]);

  const handleSend = async (text = null) => {
    const msgText = text || input;
    if (!msgText.trim() || promptsUsed >= PROMPT_LIMIT) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    let sessionId = activeSessionId;
    try {
      if (!sessionId) {
        const title = msgText.substring(0, 30);
        const { data } = await supabase.from('chat_sessions').insert({ user_id: user.id, title }).select().single();
        sessionId = data.id;
        setActiveSessionId(sessionId);
        setSessions(prev => [data, ...prev]);
      }

      await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'user', content: msgText });
      setPromptsUsed(prev => prev + 1);

      // Simple document search + AI logic (mocked for brevity in this panel migration)
      // In a real scenario, this would call the same edge function/search logic as ExplorePage
      setTimeout(async () => {
        const responseText = DUMMY_RESPONSES[dummyIndex++ % DUMMY_RESPONSES.length];
        await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'assistant', content: responseText });
        setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', text: responseText }]);
        setTyping(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      setTyping(false);
    }
  };

  const loadHistory = async (session) => {
    setActiveSessionId(session.id);
    const { data } = await supabase.from('chat_messages').select('*').eq('session_id', session.id).order('created_at', { ascending: true });
    if (data) {
      setMessages([{ id: 0, role: 'assistant', text: "Chat history loaded." }, ...data.map(d => ({ ...d, text: d.content }))]);
    }
  };

  const toggleSessionSelection = (id) => {
    const next = new Set(selectedSessions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSessions(next);
  };

  return (
    <div className="std-panel research-panel-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', height: '100%' }}>
      {/* Sidebar - History */}
      <div className="research-sidebar" style={{ background: 'var(--bg-weak)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>History</h4>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)' }}>{promptsUsed}/{PROMPT_LIMIT}</span>
        </div>
        
        <div className="history-list" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sessions.map(s => (
            <div 
                key={s.id} 
                className={`history-item-wrap ${activeSessionId === s.id ? 'active' : ''}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '4px 8px',
                  borderRadius: '10px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => loadHistory(s)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  className="std-custom-checkbox" 
                  checked={selectedSessions.has(s.id)}
                  onChange={() => toggleSessionSelection(s.id)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{new Date(s.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedSessions.size > 0 && (
            <button className="btn-outline btn-sm" style={{ color: 'red', borderColor: 'rgba(255,0,0,0.2)' }}>
                Delete {selectedSessions.size} Sessions
            </button>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="research-chat-main" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--sc-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="messages-area" style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`} style={{ display: 'flex', gap: '1rem', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>◆</div>}
              <div className="message-bubble" style={{ 
                maxWidth: '80%', 
                padding: '1rem', 
                borderRadius: '16px', 
                background: m.role === 'user' ? 'var(--primary)' : 'var(--bg-weak)',
                color: m.role === 'user' ? 'white' : 'var(--secondary)',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {typing && <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area" style={{ padding: '1.5rem', borderTop: '1px solid var(--sc-border)', display: 'flex', gap: '1rem' }}>
          <textarea 
            placeholder="Search the hub library..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--sc-border)', outline: 'none', resize: 'none' }}
            rows="1"
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          />
          <button className="special-button" onClick={() => handleSend()} disabled={!input.trim() || typing}>
             <i className="ri-send-plane-fill"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;
