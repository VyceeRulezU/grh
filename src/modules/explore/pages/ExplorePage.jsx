import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../services/supabase/supabaseClient';
import { SUGGESTED } from '../../../data/legacyData';
import grhIcon from '../../../assets/images/Logo/GRH-alone.png';
import { Helmet } from 'react-helmet-async';
import ResourceViewer from '../../research/components/ResourceViewer';
import './ExplorePage.css';

// ---------------------------------------------------------------------------
// Search intent detection — determines when to query the resource library.
// Triggers on the first message of a new chat, or when the user explicitly
// asks to search/find/look up resources. All other follow-up messages go
// straight to the AI using conversation history as context.
// ---------------------------------------------------------------------------
const isSearchIntent = (text = '') => {
  const t = text.toLowerCase().trim();
  const searchKeywords = [
    // Explicit search verbs
    'search', 'find', 'look for', 'look up', 'locate', 'retrieve',
    // Resource-seeking nouns
    'resources', 'documents', 'materials', 'reports', 'papers',
    'references', 'sources', 'literature', 'publications', 'files',
    // Question patterns that imply a library lookup
    'do you have', 'is there a', 'any info on', 'any resources',
    'any documents', 'show me', 'point me to', 'what resources',
    'what documents', 'where can i find',
    // Citation / sourcing requests
    'cite', 'source', 'bibliography', 'reference list',
  ];
  return searchKeywords.some(kw => t.includes(kw));
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
// ---------------------------------------------------------------------------
// AI call — always returns HTTP 200; reads data.error or data.content.
// Returns null on failure so the caller shows an honest error bubble.
// ---------------------------------------------------------------------------
const getAIResponse = async (userText, context = null, history = [], userId = null) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-assistant', {
      body: { userText, context, userId, conversationHistory: history }
    });

    // Supabase SDK-level error (network, CORS, function not deployed, etc.)
    if (error) {
      console.error('[GRH] functions.invoke error:', error.message);
      return null;
    }

    if (data?.error === 'daily_limit_reached') {
      return { error: 'daily_limit_reached' };
    }

    if (data?.error) {
      // Structured error from the edge function (rate limit, model not found, etc.)
      console.warn('[GRH] Edge function error:', data.error, data.detail || '');
      return null;
    }

    if (!data?.content) {
      console.warn('[GRH] No content in response:', JSON.stringify(data));
      return null;
    }

    return data.content;
  } catch (err) {
    console.error('[GRH] AI call threw:', err);
    return null;
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

const scoreResult = (result, queryKeywords) => {
  const title = (result.title || "").toLowerCase();
  const body = (result.description || result.summary || "").toLowerCase();
  
  // Weights for common tokens to prevent them from drowning out specific terms
  const COMMON_WORDS = new Set(['governance', 'public', 'resource', 'hub', 'report', 'document', 'framework', 'policy', 'strategy']);
  
  let score = 0;
  let uniqueMatches = 0;

  queryKeywords.forEach(keyword => {
    const kw = keyword.toLowerCase();
    let kwMatched = false;
    
    // Determine weight: Rare words are much more valuable for relevance
    const weightMulti = COMMON_WORDS.has(kw) ? 0.5 : 2.5;

    // 1. Title Match (High Base Weight)
    // We check for word boundaries to avoid partial matches like "governance" in "nongovernmental"
    const titleRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const titleOccurrences = (title.match(titleRegex) || []).length;
    if (titleOccurrences > 0) {
      score += titleOccurrences * 100 * weightMulti;
      kwMatched = true;
    }

    // 2. Body Match (Moderate Weight)
    const bodyRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const bodyOccurrences = (body.match(bodyRegex) || []).length;
    if (bodyOccurrences > 0) {
      score += bodyOccurrences * 5 * weightMulti;
      kwMatched = true;
    }

    if (kwMatched) uniqueMatches++;
  });

  // 3. Phrase Sequence Bonus: If keywords appear in order in the title, it's very relevant
  const combinedKeywords = queryKeywords.join(' ').toLowerCase();
  if (title.includes(combinedKeywords)) {
    score += 500;
  }

  // 4. Intersection Bonus: The more distinct words that match, the better
  // matching "Public" and "Finance" is better than matching "Finance" five times.
  if (uniqueMatches > 1) {
    score *= (uniqueMatches * 1.5);
  }

  // 5. Total Coverage Bonus: If all keywords are found in the title/body
  if (uniqueMatches === queryKeywords.length && queryKeywords.length > 1) {
    score += 300;
  }

  return score;
};

const findResourceMatch = async (query) => {
  try {
    const rawQ = query.toLowerCase();
    const stopWords = new Set([
      'what', 'is', 'the', 'of', 'in', 'and', 'to', 'for', 'about', 'how', 'can', 'me', 'tell', 'show', 'find', 'research', 
      'information', 'resource', 'please', 'with', 'from', 'this', 'that', 'they', 'their', 'them', 'these'
    ]);
    const keywords = rawQ.split(/[\s,?.!]+/)
      .filter(w => w.length > 2 && !stopWords.has(w));
    
    if (keywords.length === 0) return null;

    console.log("🔍 GovAI Enhanced Search Keywords:", keywords);

    const tables = [
      { name: 'library_resources', cols: ['title', 'description'] },
      { name: 'books', cols: ['title', 'summary'] },
      { name: 'sparc_resources', cols: ['title', 'description'] },
      { name: 'perl_resource', cols: ['title', 'description'] }
    ];
    
    const searchPromises = tables.map(async (table) => {
      const orClauses = keywords.flatMap(kw => 
        table.cols.map(col => `${col}.ilike.%${kw}%`)
      ).join(',');
      
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .or(orClauses)
        .limit(10);
      
      if (!error && data) {
        return data.map(d => ({ ...d, tableName: table.name }));
      }
      return [];
    });

    const results = await Promise.all(searchPromises);
    let allMatches = results.flat();

    if (allMatches.length > 0) {
      const ranked = allMatches
        .map(item => ({ ...item, relevanceScore: scoreResult(item, keywords) }))
        .filter(item => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      const top3 = ranked.slice(0, 3);
      
      if (top3.length === 0) return null;

      console.log(`✅ Library Matches Found:`, top3.length);

      return {
        context: top3.map((r, idx) => `Document ${idx+1}: [${r.title}] — ${r.description || r.summary || ''}`).join('\n\n'),
        resources: top3
      };
    }
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
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewingResource, setViewingResource] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTED);
  const [promptsUsed, setPromptsUsed] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLimited, setIsLimited] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
        
        // Fix: filter by user_id so we only count this user's messages
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

  const handleOverlayClick = () => setIsSidebarOpen(false);

  // Sidebar search filter
  useEffect(() => {
    const q = sidebarSearch.toLowerCase();
    setFilteredSessions(q ? chatSessions.filter(s => s.title?.toLowerCase().includes(q)) : chatSessions);
  }, [sidebarSearch, chatSessions]);

  const startNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setActiveHistoryId(null);
    setInput('');
    setConversationHistory([]);
    if (window.innerWidth <= 900) setIsSidebarOpen(false);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = (text) => {
    if (navigator.share) {
      navigator.share({ title: 'GRH AI Response', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  const handleEditSubmit = (msgId) => {
    if (!editingText.trim()) return;
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: editingText } : m));
    setEditingMsgId(null);
    handleSend(editingText);
  };

  const handleRegenerate = async (userMsgIndex) => {
    const userMsg = messages[userMsgIndex];
    if (!userMsg) return;
    // Remove last assistant reply after this user msg
    setMessages(prev => {
      const cut = prev.findIndex((m, i) => i > userMsgIndex && m.role === 'assistant');
      return cut !== -1 ? prev.slice(0, cut) : prev;
    });
    await handleSend(userMsg.text);
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachedFile(file);
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAttachedFile(new File([blob], 'voice-message.webm', { type: 'audio/webm' }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access denied.');
    }
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
        const mapped = data.map(d => ({ ...d, text: d.content }));
        setMessages([INITIAL_MESSAGE, ...mapped]);
        // Restore last 10 messages into Gemini's context so the AI can
        // continue the conversation naturally without losing memory.
        const restored = data.slice(-10).map(d => ({ role: d.role, content: d.content }));
        setConversationHistory(restored);
      } else {
        setMessages([INITIAL_MESSAGE]);
        setConversationHistory([]);
      }
    } catch (err) {
      console.error('[GRH] loadHistory error:', err);
    }
  };

  const handleSend = async (text = null) => {
    if (!user) {
      const guestQueries = parseInt(localStorage.getItem('grh_guest_queries') || '0');
      if (guestQueries >= 3) {
        setIsLimited(true);
        setMessages(prev => [...prev, { id: 'limit', role: 'assistant', text: "You've reached the 3-query limit for guests. Please sign up to continue exploring our full library." }]);
        return;
      }
      localStorage.setItem('grh_guest_queries', (guestQueries + 1).toString());
    }

    if (isLimited) return;

    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText };
    setMessages(prev => [...prev, userMsg]);
    if (!text) setInput('');
    setTyping(true);

    let currentSessionId = activeHistoryId;

    // ── DB: create/reuse session (silently) ──
    if (user?.id && !currentSessionId) {
      try {
        const title = msgText.length > 30 ? msgText.substring(0, 30) + '...' : msgText;
        const { data: sessionData, error: sessionErr } = await supabase.from('chat_sessions')
          .insert({ user_id: user.id, title })
          .select()
          .single();
        if (!sessionErr && sessionData) {
          currentSessionId = sessionData.id;
          setActiveHistoryId(currentSessionId);
          setChatSessions(prev => [sessionData, ...prev]);
        } else {
          console.warn('[GRH] chat_sessions insert failed:', sessionErr?.message);
        }
      } catch (err) {
        console.warn('[GRH] chat_sessions error:', err);
      }
    }

    // ── DB: persist user message (silently) ──
    if (user?.id && currentSessionId) {
      try {
        await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content: msgText
        });
        setPromptsUsed(prev => prev + 1);
      } catch (err) {
        console.warn('[GRH] chat_messages user insert failed:', err);
      }
    }

    // ── Smart search decision ──────────────────────────────────────────────
    // Search the resource library only on:
    //   1. The very first user message in a new chat (to ground the AI in Hub content)
    //   2. When the user explicitly asks to search / find / look up resources
    // All other follow-up messages go straight to the AI with conversation
    // history as context — no DB round-trip needed.
    // ────────────────────────────────────────────────────────────────────────
    const isFirstMessage = messages.length === 1; // only the greeting exists
    const shouldSearch = isFirstMessage || isSearchIntent(msgText);

    let referencedResources = [];
    let resourceContext = null;

    if (shouldSearch) {
      try {
        const searchResult = await findResourceMatch(msgText);
        if (searchResult) {
          referencedResources = searchResult.resources;
          resourceContext = searchResult.context;
          console.log(`[GRH] Library search: ${referencedResources.length} resources found.`);
        }
      } catch (err) {
        console.warn('[GRH] Resource search failed:', err);
      }
    } else {
      console.log('[GRH] Conversational follow-up — skipping library search, resuming with AI context.');
    }

    // ── AI response ──────────────────────────────────────────────────────────
    try {
      const aiOutput = await getAIResponse(
        msgText,
        resourceContext,      // null for conversational follow-ups
        conversationHistory,  // full history so Gemini always has context
        user?.id
      );

      if (aiOutput?.error === 'daily_limit_reached') {
        setTyping(false);
        setIsLimited(true);
        setMessages(prev => [...prev, {
          id: 'limit',
          role: 'assistant',
          text: "You've reached your 20 daily research queries. Come back tomorrow for more deep-dive research."
        }]);
        return;
      }

      if (aiOutput === null) {
        // AI is down / quota / network error — show a clear, honest error bubble
        setTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          role: 'assistant',
          text: "I'm temporarily unable to reach the AI service. This may be a brief network issue or service interruption. Please try again in a moment."
        }]);
        return;
      }

      const responseText = aiOutput;

      // ── DB: persist assistant message (silently) ──
      let aiMsgId = Date.now() + 1;
      if (user?.id && currentSessionId) {
        try {
          const { data: aiMsgData } = await supabase.from('chat_messages').insert({
            session_id: currentSessionId,
            role: 'assistant',
            content: responseText
          }).select().single();
          if (aiMsgData?.id) aiMsgId = aiMsgData.id;
        } catch (err) {
          console.warn('[GRH] chat_messages assistant insert failed:', err);
        }
      }

      setTyping(false);
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'assistant',
        text: responseText,
        source: shouldSearch ? 'ai_grounded' : 'ai_conversational',
        fullResources: referencedResources
      }]);

      // Keep last 10 messages (5 exchanges) in memory for Gemini context
      setConversationHistory(prev => {
        const updated = [...prev,
          { role: 'user', content: msgText },
          { role: 'assistant', content: responseText }
        ];
        return updated.slice(-10);
      });

      // ── DB: update session timestamp (fire-and-forget) ──
      if (user?.id && currentSessionId) {
        supabase.from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSessionId)
          .then(null, () => {});
      }

    } catch (err) {
      console.error('[GRH] Unhandled AI error:', err);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        role: 'assistant',
        text: "Something unexpected happened. Please try sending your message again."
      }]);
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

          {/* Sidebar search */}
          <div className="sidebar-search-wrap">
            <span className="material-symbols-outlined sidebar-search-icon">search</span>
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="Search chats..."
              value={sidebarSearch}
              onChange={e => setSidebarSearch(e.target.value)}
            />
          </div>

          <div className="history-group-label" style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>RECENT RESEARCH</span>
            <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{promptsUsed}/{PROMPT_LIMIT} used</span>
          </div>
          {filteredSessions.map(item => (
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
          {filteredSessions.length === 0 && <p style={{fontSize: '0.8rem', color: 'var(--text-soft)', padding: '0 1rem'}}>{sidebarSearch ? 'No results found.' : 'No chat history yet.'}</p>}
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
            <div key={msg.id || i} className={`explore-message-row ${msg.role}`}>
              <div className={`explore-avatar ${msg.role === 'assistant' ? 'explore-assistant-avatar' : 'explore-user-avatar'}`}>
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
              <div className={`explore-message-bubble ${msg.role} ${msg.fullResources?.length > 0 ? 'has-resource' : ''}`}>
                {/* Editing mode for user messages */}
                {msg.role === 'user' && editingMsgId === msg.id ? (
                  <div className="msg-edit-wrap">
                    <textarea
                      className="msg-edit-input"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      autoFocus
                    />
                    <div className="msg-edit-actions">
                      <button className="msg-edit-save" onClick={() => handleEditSubmit(msg.id)}>Send</button>
                      <button className="msg-edit-cancel" onClick={() => setEditingMsgId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="explore-message-content">
                    {renderMessage(msg.text || msg.content)}
                  </div>
                )}

                {/* Attached file badge */}
                {msg.fileName && (
                  <div className="msg-file-badge">
                    <span className="material-symbols-outlined">attach_file</span>
                    {msg.fileName}
                  </div>
                )}

                {msg.fullResources?.length > 0 && (
                  <div className="referenced-resources-container">
                    {msg.fullResources.map(res => (
                      <div key={res.id} className="referenced-resource-card">
                        <div className="ref-card-header">
                          <span className="material-symbols-outlined">library_books</span>
                          <span>{res.tableName?.replace('_', ' ').toUpperCase()} RESOURCE</span>
                        </div>
                        <div className="ref-card-body">
                          <h4>{res.title}</h4>
                          <p>{(res.description || res.summary || '').substring(0, 80)}...</p>
                          <button className="preview-btn-sm" onClick={() => setViewingResource(res)}>
                            View Document
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action bar — shown on hover via CSS */}
                {editingMsgId !== msg.id && msg.id !== 1 && (
                  <div className={`msg-actions ${msg.role}`}>
                    {/* Copy */}
                    <button
                      className="msg-action-btn"
                      title="Copy"
                      onClick={() => handleCopy(msg.text || msg.content || '', msg.id)}
                    >
                      <span className="material-symbols-outlined">
                        {copiedId === msg.id ? 'check' : 'content_copy'}
                      </span>
                    </button>

                    {/* Share (assistant only) */}
                    {msg.role === 'assistant' && (
                      <button className="msg-action-btn" title="Share" onClick={() => handleShare(msg.text || msg.content || '')}>
                        <span className="material-symbols-outlined">share</span>
                      </button>
                    )}

                    {/* Edit (user only) */}
                    {msg.role === 'user' && (
                      <button
                        className="msg-action-btn"
                        title="Edit"
                        onClick={() => { setEditingMsgId(msg.id); setEditingText(msg.text || ''); }}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    )}

                    {/* Regenerate (assistant only) */}
                    {msg.role === 'assistant' && (
                      <button
                        className="msg-action-btn"
                        title="Regenerate"
                        onClick={() => handleRegenerate(messages.findIndex(m => m.id === msg.id) - 1)}
                      >
                        <span className="material-symbols-outlined">refresh</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="explore-message-row assistant">
              <div className="explore-avatar explore-assistant-avatar">◆</div>
              <div className="explore-message-bubble assistant">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="explore-input-section">
          {/* Attached file preview */}
          {attachedFile && (
            <div className="input-file-preview">
              <span className="material-symbols-outlined">
                {attachedFile.type.startsWith('audio') ? 'mic' : 'attach_file'}
              </span>
              <span className="input-file-name">{attachedFile.name}</span>
              <button className="input-file-remove" onClick={handleRemoveFile}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          )}

          <div className="input-wrapper">
            {/* File upload */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,.doc,.docx,.txt"
              onChange={handleFileAttach}
            />
            <button
              className="input-icon-btn"
              title="Attach file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLimited}
            >
              <span className="material-symbols-outlined">attach_file</span>
            </button>

            {/* Mic */}
            <button
              className={`input-icon-btn ${isRecording ? 'recording' : ''}`}
              title={isRecording ? 'Stop recording' : 'Voice input'}
              onClick={handleMicToggle}
              disabled={isLimited}
            >
              <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'mic'}</span>
            </button>

            <textarea
              className="chat-input"
              rows="1"
              placeholder={isLimited ? "Daily limit reached." : "Ask anything about governance, PFM, or integrity..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              disabled={isLimited}
            />
            <button className="send-btn" onClick={() => handleSend()} disabled={(!input.trim() && !attachedFile) || isLimited}>
              ↑
            </button>
          </div>
          <p className="input-hint">{isLimited ? "Research limit reached for today." : "AI may generate inaccurate information. Cross-reference with hub source documents."}</p>
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
