import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase/supabaseClient';

// ---------------------------------------------------------------------------
// Dummy AI responses (Fallback)
// ---------------------------------------------------------------------------
const DUMMY_RESPONSES = [
  "Based on the hub's resources, good governance rests on **accountability, transparency, rule of law, participation, and effectiveness**. The World Bank Governance Indicators framework breaks these into six measurable dimensions. Would you like me to expand on any specific one?",
  "The PEFA framework (Public Expenditure & Financial Accountability) uses 31 performance indicators across seven pillars to assess PFM system quality. Nigeria's 2021 PEFA score highlighted challenges in budget credibility and external audit follow-up. Would you like a detailed breakdown?",
  "UNCAC (UN Convention Against Corruption) — ratified by 190 countries — establishes four pillars: **prevention, criminalisation, international cooperation, and asset recovery**. Chapter II is particularly relevant for preventive measures in public institutions.",
  "Electoral system design directly affects political representation. Proportional representation (PR) tends to increase minority and women's representation, while single-member plurality systems concentrate power. The IDEA Electoral System Design Handbook offers 33 country case studies.",
  "The Open Government Partnership (OGP), founded in 2011, now has 75 member countries. Members commit to biennial National Action Plans on transparency, civic participation, and accountability.",
  "Strengthening legislative oversight requires: (1) well-resourced committee systems, (2) access to independent fiscal analysis (e.g., Parliamentary Budget Offices), (3) timely submission of audited accounts, and (4) robust PAC (Public Accounts Committee) follow-up mechanisms.",
];

let dummyIndex = 0;

const PROMPT_LIMIT = 20;

const isFollowUpIntent = (text = "") => {
  const t = text.toLowerCase().trim().replace(/[?.!]/g, '');
  const intents = [
    'yes', 'yeah', 'sure', 'ok', 'okay', 'proceed', 'go ahead', 'all', 'summarize all', 
    'tell me more', 'more', 'explain', 'explain more', 'detailed', 'summary'
  ];
  return intents.some(intent => t === intent || t.startsWith('summarize') || t.includes('tell me more'));
};

const getDummyResponse = (userText = "", foundDocs = [], isContinuation = false) => {
  if (foundDocs.length > 0) {
     const docTitles = foundDocs.map(d => `**${d.title}**`).join(', ');
     if (isContinuation) {
       return `Certainly! Based on the documents I found (${docTitles}), here is a consolidated summary:\n\nThe Hub's evidence suggests that institutional reforms in this area are driven by three main factors: integrated resource management, transparent reporting, and local stakeholder engagement.\n\nWould you like me to dive deeper into any of these specific documents?`;
     }
     return `I've analyzed the Hub's research library and found ${foundDocs.length} specific resources regarding "${userText.substring(0, 30)}...". Particularly, ${docTitles} contain relevant data.\n\nWould you like me to summarize one of these specific documents for you?`;
  }
  const response = DUMMY_RESPONSES[dummyIndex % DUMMY_RESPONSES.length];
  dummyIndex++;
  return response;
};

const getAIResponse = async (userText, context = null, history = [], userId = null, foundDocs = [], isContinuation = false) => {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-assistant', {
      body: { userText, context, userId, conversationHistory: history }
    });
    if (data?.error === 'daily_limit_reached') return { error: 'daily_limit_reached' };
    if (error || !data?.content) return getDummyResponse(userText, foundDocs, isContinuation);
    return data.content;
  } catch (err) {
    console.error("AI Assistant Error:", err);
    return getDummyResponse(userText, foundDocs, isContinuation);
  }
};

const checkCache = async (query) => {
  try {
    const normalized = query.trim().toLowerCase();
    const { data } = await supabase.from('chat_research_cache').select('*').eq('user_query', normalized).single();
    if (data) {
      supabase.rpc('increment_cache_hit', { row_id: data.id }).catch(() => {});
      return data;
    }
    return null;
  } catch (err) { return null; }
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
  } catch (err) { console.error("Cache Update Error:", err); }
};

const scoreResult = (result, queryKeywords) => {
  const title = (result.title || "").toLowerCase();
  const body = (result.description || result.summary || "").toLowerCase();
  const COMMON_WORDS = new Set(['governance', 'public', 'resource', 'hub', 'report', 'document', 'framework', 'policy', 'strategy']);
  let score = 0;
  let uniqueMatches = 0;
  queryKeywords.forEach(keyword => {
    const kw = keyword.toLowerCase();
    let kwMatched = false;
    const weightMulti = COMMON_WORDS.has(kw) ? 0.5 : 2.5;
    const titleRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const titleOccurrences = (title.match(titleRegex) || []).length;
    if (titleOccurrences > 0) { score += titleOccurrences * 100 * weightMulti; kwMatched = true; }
    const bodyRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const bodyOccurrences = (body.match(bodyRegex) || []).length;
    if (bodyOccurrences > 0) { score += bodyOccurrences * 5 * weightMulti; kwMatched = true; }
    if (kwMatched) uniqueMatches++;
  });
  if (title.includes(queryKeywords.join(' ').toLowerCase())) score += 500;
  if (uniqueMatches > 1) score *= (uniqueMatches * 1.5);
  if (uniqueMatches === queryKeywords.length && queryKeywords.length > 1) score += 300;
  return score;
};

const findResourceMatch = async (query) => {
  try {
    const rawQ = query.toLowerCase();
    const stopWords = new Set(['what', 'is', 'the', 'of', 'in', 'and', 'to', 'for', 'about', 'how', 'can', 'me', 'tell', 'show', 'find', 'research', 'information', 'resource', 'please', 'with', 'from', 'this', 'that', 'they', 'their', 'them', 'these']);
    const keywords = rawQ.split(/[\s,?.!]+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (keywords.length === 0) return null;
    const tables = [
      { name: 'library_resources', cols: ['title', 'description'] },
      { name: 'books', cols: ['title', 'summary'] },
      { name: 'sparc_resources', cols: ['title', 'description'] },
      { name: 'perl_resource', cols: ['title', 'description'] }
    ];
    let allMatches = [];
    for (const table of tables) {
      const orClauses = keywords.flatMap(kw => table.cols.map(col => `${col}.ilike.%${kw}%`)).join(',');
      const { data, error } = await supabase.from(table.name).select('*').or(orClauses).limit(10);
      if (!error && data) allMatches.push(...data.map(d => ({ ...d, tableName: table.name })));
    }
    if (allMatches.length > 0) {
      const ranked = allMatches
        .map(item => ({ ...item, relevanceScore: scoreResult(item, keywords) }))
        .filter(item => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      const top3 = ranked.slice(0, 3);
      if (top3.length === 0) return null;
      return {
        context: top3.map((r, idx) => `Document ${idx+1}: [${r.title}] — ${r.description || r.summary || ''}`).join('\n\n'),
        resources: top3
      };
    }
    return null;
  } catch (err) { console.error("Resource Search Error:", err); return null; }
};

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
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLimited, setIsLimited] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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
    if (isLimited) return;

    const msgText = text || input;
    if (!msgText.trim()) return;

    if (promptsUsed >= PROMPT_LIMIT) {
      setIsLimited(true);
      setMessages(prev => [...prev, { id: 'limit', role: 'assistant', text: "You've reached your 20 monthly research queries. Access would refresh at the start of next month." }]);
      return;
    }

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

      // --- UNIFIED RESOURCE + AI LOGIC (Migrated from Explore Page) ---
      let responseText = "";
      let source = "ai";
      let referencedResources = [];
      let carriedContext = null;
      let isContinuation = false;

      // 1. Check Cache
      const cached = await checkCache(msgText);
      if (cached) {
        responseText = cached.response_content;
        source = cached.source_type;
      } else {
        // 2. CONVERSATIONAL INTENT DETECTION
        const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
        if (isFollowUpIntent(msgText) && lastAssistantMsg?.fullResources?.length > 0) {
          referencedResources = lastAssistantMsg.fullResources;
          carriedContext = lastAssistantMsg.fullResources.map((r, idx) => `Document ${idx+1}: [${r.title}] — ${r.description || r.summary || ''}`).join('\n\n');
          isContinuation = true;
        } else {
          const searchResult = await findResourceMatch(msgText);
          if (searchResult) {
            referencedResources = searchResult.resources;
            carriedContext = searchResult.context;
          }
        }

        // 3. AI Synthesis
        const aiOutput = await getAIResponse(msgText, carriedContext, conversationHistory, user?.id, referencedResources, isContinuation);
        
        if (aiOutput?.error === 'daily_limit_reached') {
          setTyping(false);
          setIsLimited(true);
          setMessages(prev => [...prev, { id: 'limit', role: 'assistant', text: "You've reached your monthly research query limit." }]);
          return;
        }

        responseText = aiOutput;
        source = 'ai_unified';
        await updateCache(msgText, responseText, 'ai_unified');
      }

      const { data: aiMsgData } = await supabase.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: responseText
      }).select().single();

      setTyping(false);
      setMessages(prev => [...prev, { 
        id: aiMsgData?.id || Date.now(), 
        role: 'assistant', 
        text: responseText,
        fullResources: referencedResources
      }]);

      setConversationHistory(prev => {
        const newHistory = [...prev, { role: 'user', content: msgText }, { role: 'assistant', content: responseText }];
        return newHistory.slice(-10);
      });

      await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);

    } catch (err) {
      console.error(err);
      setTyping(false);
    }
  };

  const loadHistory = async (session) => {
    setActiveSessionId(session.id);
    setShowSidebar(false); // Close sidebar on mobile after selection
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

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      { id: Date.now(), role: 'assistant', text: "Hello! I'm your AI Research Assistant. I can help you find insights across our entire library. What are you researching today?" }
    ]);
    setInput('');
  };

  return (
    <div className="std-panel research-panel-layout">
      {/* Sidebar - History */}
      <div className={`research-sidebar ${showSidebar ? 'mobile-show' : ''}`}>
        <div className="research-sidebar-header">
          <h4>Research History</h4>
          <button 
            className="close-sidebar-btn mobile-only" 
            onClick={() => setShowSidebar(false)}
          >
            <i className="ri-close-line"></i>
          </button>
          <button 
            className="row-action desktop-only" 
            title="New Research" 
            onClick={handleNewChat}
          >
            <i className="ri-add-line"></i>
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '-1rem', opacity: 0.8 }}>
          {promptsUsed}/{PROMPT_LIMIT} prompts used this month
        </div>
        
        <div className="history-list">
          {sessions.map(s => (
            <div 
                key={s.id} 
                className={`history-item-wrap ${activeSessionId === s.id ? 'active' : ''}`}
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
              <div className="history-item-content">
                <div className="history-item-title">{s.title}</div>
                <div className="history-item-date">{new Date(s.updated_at).toLocaleDateString()}</div>
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
      <div className="research-chat-main">
        <div className="research-chat-header">
          <button className="history-toggle-btn" onClick={() => setShowSidebar(true)}>
            <i className="ri-history-line"></i>
            <span>History</span>
          </button>
          <button className="new-chat-mobile-btn" onClick={handleNewChat}>
            <i className="ri-add-line"></i>
          </button>
        </div>
        <div className="messages-area">
          {messages.map((m, i) => (
            <div key={i} className={`message-row ${m.role}`}>
              {m.role === 'assistant' && <div className="assistant-avatar">◆</div>}
              <div className="message-bubble">
                {m.text}
              </div>
            </div>
          ))}
          {typing && <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        {showSidebar && <div className="research-sidebar-overlay" onClick={() => setShowSidebar(false)}></div>}

        <div className="research-input-section">
          <textarea 
            placeholder="Search the hub library..." 
            value={input}
            onChange={e => setInput(e.target.value)}
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
