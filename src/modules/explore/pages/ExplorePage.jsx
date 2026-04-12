import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import { SUGGESTED } from '../../../data/legacyData';
import grhIcon from '../../../assets/images/Logo/GRH-alone.png';
import { Helmet } from 'react-helmet-async';
import ResourceViewer from '../../research/components/ResourceViewer';
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
// AI Assistant call (Using Gemini 1.5 Flash with Context)
// ---------------------------------------------------------------------------
const getAIResponse = async (userText, context = null) => {
  try {
    // Try Gemini first
    const { data, error } = await supabase.functions.invoke('gemini-assistant', {
      body: { 
        userText,
        context: context // Pass the library resource context!
      }
    });

    if (error || !data?.content) {
      // Fallback to OpenAI if Gemini fails or is not setup
      const { data: oaiData, error: oaiError } = await supabase.functions.invoke('openai-assistant', {
        body: { userText }
      });
      if (oaiError) throw oaiError;
      return oaiData?.content || getDummyResponse();
    }
    
    return data.content;
  } catch (err) {
    console.error("AI Assistant Error:", err);
    return getDummyResponse();
  }
};

// ---------------------------------------------------------------------------
// Caching & Resource Search Logic
// ---------------------------------------------------------------------------
const checkCache = async (query) => {
  try {
    const normalized = query.trim().toLowerCase();
    const { data } = await supabase
      .from('chat_research_cache')
      .select('*')
      .eq('user_query', normalized)
      .single();
    
    if (data) {
      // Increment hit count asynchronously
      supabase.rpc('increment_cache_hit', { row_id: data.id }).catch(() => {});
      return data;
    }
    return null;
  } catch (err) {
    return null;
  }
};

const updateCache = async (query, content, sourceType) => {
  try {
    const normalized = query.trim().toLowerCase();
    await supabase.from('chat_research_cache').upsert({
      user_query: normalized,
      response_content: content,
      source_type: sourceType,
      last_used_at: new Date().toISOString()
    }, { onConflict: 'user_query' });
  } catch (err) {
    console.error("Cache Update Error:", err);
  }
};

const findResourceMatch = async (query) => {
  try {
    const rawQ = query.toLowerCase();
    const stopWords = new Set(['what', 'is', 'the', 'of', 'in', 'and', 'to', 'for', 'about', 'how', 'can', 'me', 'tell', 'show', 'find', 'research', 'information', 'resource', 'please']);
    const keywords = rawQ.split(/[\s,?.!]+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    if (keywords.length === 0) return null;

    console.log("🔍 GovAI Search Keywords:", keywords);

    const tables = [
      { name: 'library_resources', cols: ['title', 'description'] },
      { name: 'books', cols: ['title', 'summary'] },
      { name: 'sparc_resources', cols: ['title', 'description'] },
      { name: 'perl_resource', cols: ['title', 'description'] }
    ];
    
    let matches = [];

    for (const table of tables) {
      // Create OR string only for columns that exist in THIS table
      const orClauses = keywords.flatMap(kw => 
        table.cols.map(col => `${col}.ilike.%${kw}%`)
      ).join(',');
      
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .or(orClauses)
        .limit(3);
      
      if (error) {
        console.warn(`⚠️ Search error on ${table.name}:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        matches.push(...data.map(d => ({ ...d, tableName: table.name })));
      }
    }

    if (matches.length > 0) {
      // Ranking Logic
      const ranked = matches.map(item => {
        let score = 0;
        const mainText = (item.title || "").toLowerCase();
        const subText = (item.description || item.summary || "").toLowerCase();
        
        keywords.forEach(kw => {
          if (mainText.includes(kw)) score += 10; // Title match is high weight
          if (subText.includes(kw)) score += 2;  // Description match
          if (mainText === kw) score += 20;      // Perfect title match
        });
        return { ...item, score };
      }).sort((a, b) => b.score - a.score);

      const best = ranked[0];
      const isHighConfidence = best.score >= 10;
      const desc = best.description || best.summary || "Archived hub document.";
      
      console.log(`✅ Library Match Found (${isHighConfidence ? 'High' : 'Low'}):`, best.title);

      return {
        text: `I found a relevant resource: **${best.title}**.\n\n**Summary:** ${desc.substring(0, 300)}...\n\n[Preview Document](preview:${best.tableName}:${best.id})`,
        source: 'resource',
        confidence: isHighConfidence ? 'high' : 'medium',
        context: ranked.slice(0, 4).map(r => `[${r.tableName}] ${r.title}: ${r.description || r.summary || ''}`).join('\n\n'),
        fullResource: best // Pass the full object so we can preview it
      };
    }
    
    console.log("❌ No relevant library resources found for these keywords.");
    return null;
  } catch (err) {
    console.error("Resource Search Error:", err);
    return null;
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const INITIAL_MESSAGE = { id: 1, role: 'assistant', text: "Hello! I'm the Governance AI Assistant, trained on all the resources in this hub. How can I help with your research today?" };

const PROMPT_LIMIT = 20;

// Simple markdown-to-JSX converter for links and bold text
const renderMessage = (text, onPreview = null) => {
  if (!text) return null;
  // Bold: **text**
  let parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const label = match[1];
        const url = match[2];
        
        // Handle internal preview links
        if (url.startsWith('preview:') && onPreview) {
          return (
            <button 
              key={i} 
              className="preview-trigger-btn" 
              onClick={() => onPreview()}
            >
              <span className="material-symbols-outlined">visibility</span>
              {label}
            </button>
          );
        }
        
        return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="message-link">{label}</a>;
      }
    }
    return part;
  });
};

const ExplorePage = ({ user, onNavigate }) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [chatSessions, setChatSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewingResource, setViewingResource] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTED);
  const [promptsUsed, setPromptsUsed] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchHistoryAndUsage = async () => {
      try {
        const { data: sessions } = await supabase.from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        if (sessions) setChatSessions(sessions);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);
        
        const { count } = await supabase.from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user')
          .gte('created_at', startOfMonth.toISOString());
        
        if (count !== null) setPromptsUsed(count);
      } catch (err) {
        console.error("Fetch err:", err);
      }
    };
    fetchHistoryAndUsage();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  const startNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setActiveHistoryId(null);
    setInput('');
    if (window.innerWidth <= 900) setIsSidebarOpen(false);
  };

  const loadHistory = async (session) => {
    setActiveHistoryId(session.id);
    if (window.innerWidth <= 900) setIsSidebarOpen(false);
    
    try {
      const { data } = await supabase.from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });
        
      if (data && data.length > 0) {
        setMessages([INITIAL_MESSAGE, ...data.map(d => ({...d, text: d.content}))]);
      } else {
        setMessages([INITIAL_MESSAGE]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (text = null) => {
    if (!user) {
      alert("Please login to use the Research Assistant.");
      return;
    }
    
    if (promptsUsed >= PROMPT_LIMIT) {
      alert("You have reached your free monthly limit of 10 chats. Please try again next month.");
      return;
    }

    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setTyping(true);

    let currentSessionId = activeHistoryId;
    try {
      if (!currentSessionId) {
        const title = msgText.length > 30 ? msgText.substring(0, 30) + '...' : msgText;
        const { data: sessionData, error: sessionErr } = await supabase.from('chat_sessions')
          .insert({ user_id: user.id, title })
          .select()
          .single();
          
        if (sessionErr) throw sessionErr;
        currentSessionId = sessionData.id;
        setActiveHistoryId(currentSessionId);
        setChatSessions(prev => [sessionData, ...prev]);
      }

      await supabase.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'user',
        content: msgText
      });
      setPromptsUsed(prev => prev + 1);

      // --- UNIFIED RESOURCE + AI LOGIC ---
      let responseText = "";
      let source = "ai";
      let referencedResource = null;

      // 1. Check Cache (Highest Priority)
      const cached = await checkCache(msgText);
      if (cached) {
        responseText = cached.response_content;
        source = cached.source_type;
      } else {
        // 2. Search Library Resources (Always done to provide context)
        const resourceMatch = await findResourceMatch(msgText);
        if (resourceMatch) {
          referencedResource = resourceMatch.fullResource;
        }

        // 3. AI Synthesis (Always called, grounded by resource if found)
        responseText = await getAIResponse(msgText, resourceMatch?.context || null);
        source = 'ai_unified';
        
        // 4. Update Cache with the synthesized result
        await updateCache(msgText, responseText, 'ai_unified');
      }
      // ------------------------------------

      const { data: aiMsgData } = await supabase.from('chat_messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: responseText
      }).select().single();

      setTyping(false);
      setMessages(prev => [...prev, { 
        id: aiMsgData?.id || Date.now()+1, 
        role: 'assistant', 
        text: responseText, 
        source,
        fullResource: referencedResource 
      }]);
      
      await supabase.from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);
        
    } catch (err) {
      console.error(err);
      setTyping(false);
      alert("Error handling message. Please try again.");
    }
  };

  return (
    <div className="explore-layout">
      <Helmet>
        <title>Governance AI Assistant | Research & Insights | GRH</title>
        <meta name="description" content="Interact with our AI Research Assistant to explore governance frameworks, PFM strategies, and institutional reform insights powered by GovAI-Core." />
      </Helmet>
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={handleOverlayClick} /> }

      <aside className={`chat-sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src={grhIcon} alt="GRH" className="sidebar-icon-logo" loading="lazy" />
          </div>
        </div>

        <div className="chat-history">
          <button className="new-chat-btn" onClick={startNewChat}>+ New Chat</button>

          <div className="history-group-label" style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>RECENT RESEARCH</span>
            <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{promptsUsed}/{PROMPT_LIMIT} used</span>
          </div>
          {chatSessions.map(item => (
            <button
              key={item.id}
              className={`history-item ${activeHistoryId === item.id ? 'active' : ''}`}
              onClick={() => loadHistory(item)}
            >
              <span className="history-icon">💬</span>
              <div className="history-info">
                <span className="history-title">{item.title}</span>
                <span className="history-date">{new Date(item.updated_at).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
          {chatSessions.length === 0 && <p style={{fontSize: '0.8rem', color: 'var(--text-soft)', padding: '0 1rem'}}>No chat history yet.</p>}
        </div>

        <div className="sidebar-footer">
          <div className="powered-by">
            <span>POWERED BY</span>
            <span className="powered-name">GovAI-Core v2.4</span>
          </div>
          <p className="sidebar-note">
            Analysis based on {user ? user.name : 'Guest'}'s research library access level.
          </p>
          <div style={{marginTop: '0.5rem', width: '100%', height: '4px', background: 'var(--bg-weak)', borderRadius: '2px', overflow: 'hidden'}}>
             <div style={{width: `${(promptsUsed/PROMPT_LIMIT)*100}%`, height: '100%', background: promptsUsed >= PROMPT_LIMIT ? 'var(--danger)' : 'var(--primary)'}}></div>
          </div>
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

          <button className="special-button" onClick={() => onNavigate('welcome')}>
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="back-home-text">Back to Website</span>
          </button>
        </div>

        <div className="messages-area">
          {messages.length === 1 && (
            <div className="suggestions-area">
              <div className="suggestions-label">Explore common research topics:</div>
              <div className="suggestions-grid">
                {suggestions.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} disabled={promptsUsed >= PROMPT_LIMIT}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={msg.id || i} className={`message-row ${msg.role}`}>
              <div className={`avatar ${msg.role === 'assistant' ? 'assistant-avatar' : 'user-avatar'}`}>
                {msg.role === 'assistant' ? '◆' : (
                  user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', backgroundColor: 'var(--bg-weak)' }} 
                      loading="lazy"
                    />
                  ) : (
                    user ? user.name?.[0]?.toUpperCase() : 'U'
                  )
                )}
              </div>
              <div className={`message-bubble ${msg.role} ${msg.fullResource ? 'has-resource' : ''}`}>
                <div className="message-content">
                  {renderMessage(msg.text || msg.content)}
                </div>
                
                {msg.fullResource && (
                  <div className="referenced-resource-card">
                    <div className="ref-card-header">
                      <span className="material-symbols-outlined">library_books</span>
                      <span>Referenced Hub Resource</span>
                    </div>
                    <div className="ref-card-body">
                      <h4>{msg.fullResource.title}</h4>
                      <p>{(msg.fullResource.description || msg.fullResource.summary || '').substring(0, 80)}...</p>
                      <button className="preview-btn-sm" onClick={() => setViewingResource(msg.fullResource)}>
                        View Document
                      </button>
                    </div>
                  </div>
                )}
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
              placeholder={promptsUsed >= PROMPT_LIMIT ? "Monthly limit reached (10/10)." : "Ask anything about governance, PFM, or integrity..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              disabled={promptsUsed >= PROMPT_LIMIT}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={!input.trim() || promptsUsed >= PROMPT_LIMIT}>
              ↑
            </button>
          </div>
          <p className="input-hint">{promptsUsed >= PROMPT_LIMIT ? "You have exhausted your free monthly chats." : "AI may generate inaccurate information. Cross-reference with hub source documents."}</p>
        </div>
      </div>
      
      {/* In-App Resource Viewer */}
      <ResourceViewer 
        isOpen={!!viewingResource} 
        onClose={() => setViewingResource(null)} 
        resource={viewingResource} 
      />
    </div>
  );
};

export default ExplorePage;
