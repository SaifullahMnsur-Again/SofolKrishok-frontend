import { useState, useEffect, useRef } from 'react';
import { chatAPI, farmingAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load sessions and lands on mount
  useEffect(() => {
    loadSessions();
    loadLands();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = async () => {
    try {
      const { data } = await chatAPI.getSessions();
      const list = data.results || data;
      setSessions(list);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadLands = async () => {
    try {
      const { data } = await farmingAPI.getLands();
      setLands(data.results || data);
    } catch {
      // No lands
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const { data } = await chatAPI.getSession(sessionId);
      setActiveSession(data);
      setMessages(data.messages || []);
      if (data.land_parcel) {
        setSelectedLand(String(data.land_parcel));
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  const handleSelectSession = (session) => {
    loadSession(session.id);
    setMobileSessionsOpen(false);
  };

  const handleNewChat = () => {
    setActiveSession(null);
    setMessages([]);
    setSelectedLand('');
    setMobileSessionsOpen(false);
    inputRef.current?.focus();
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSession?.id === sessionId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Optimistically add user message to UI
    const tempUserMsg = { role: 'user', content: userMessage, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const payload = {
        message: userMessage,
        ...(activeSession?.id && { session_id: activeSession.id }),
        ...(selectedLand && { land_id: parseInt(selectedLand) }),
      };

      const { data } = await chatAPI.sendMessage(payload);

      // Add assistant response
      const assistantMsg = { role: 'assistant', content: data.response, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update or set active session
      if (!activeSession) {
        setActiveSession({ id: data.session_id, title: data.session_title });
      } else {
        setActiveSession((prev) => ({ ...prev, title: data.session_title }));
      }

      // Refresh sessions list
      loadSessions();

    } catch (err) {
      const backendError = err?.response?.data?.error;
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ ${backendError || 'Failed to get response. Please check your connection and try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className="chat-layout">
      {/* ===== Sessions Sidebar ===== */}
      <div className={`chat-sessions ${mobileSessionsOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="chat-sessions-header">
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>💬 Chats</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handleNewChat}>
              + New
            </button>
            {/* Mobile close button */}
            <button
              className="chat-mobile-sessions-toggle btn btn-ghost btn-sm"
              onClick={() => setMobileSessionsOpen(false)}
              style={{ fontSize: '1.1rem', padding: '6px 10px' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="chat-sessions-list">
          {loadingSessions ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
              <div className="loading-spinner" />
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No chat history yet.<br />Start a new conversation!
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`chat-session-item ${activeSession?.id === session.id ? 'active' : ''}`}
                onClick={() => handleSelectSession(session)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="chat-session-title">{session.title}</div>
                  <button
                    className="btn btn-ghost"
                    onClick={(e) => handleDeleteSession(e, session.id)}
                    style={{ padding: 2, fontSize: '0.75rem', minWidth: 'unset', minHeight: 'unset' }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
                <div className="chat-session-meta">
                  {session.message_count} messages • {formatDate(session.updated_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== Chat Main Area ===== */}
      <div className="chat-main">
        {/* Header */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            {/* Mobile sessions toggle */}
            <button
              className="chat-mobile-sessions-toggle btn btn-secondary btn-sm"
              onClick={() => setMobileSessionsOpen(true)}
              style={{ flexShrink: 0, padding: '8px 12px' }}
            >
              💬 Chats
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeSession?.title || '🤖 AI Assistant'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {activeSession ? `Session #${activeSession.id}` : 'Start a conversation'}
                {activeSession && ` • ${messages.length} msgs`}
              </div>
            </div>
          </div>

          {/* Land context selector */}
          {lands.length > 0 && (
            <select
              className="input-field"
              value={selectedLand}
              onChange={(e) => setSelectedLand(e.target.value)}
              style={{ maxWidth: 200, fontSize: '0.8rem', padding: '6px 10px', minHeight: 36 }}
            >
              <option value="">🌾 No land context</option>
              {lands.map((l) => (
                <option key={l.id} value={l.id}>
                  📍 {l.name} {l.soil_type ? `(${l.soil_type})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', textAlign: 'center', gap: 16,
              padding: '0 12px',
            }}>
              <span style={{ fontSize: '3.5rem' }}>🌿</span>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  SofolKrishok AI Assistant
                </div>
                <div style={{ fontSize: '0.85rem', maxWidth: 360 }}>
                  Ask me anything about farming — crop diseases, soil management,
                  weather planning, or market advice.
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
                {[
                  'আমার ধানের পাতা হলুদ হচ্ছে',
                  'Best fertilizer for wheat?',
                  'How to prevent corn leaf blight?',
                  'আলুর দাম বাড়বে কি?',
                ].map((q, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                <div className="chat-message-avatar">
                  {msg.role === 'user' ? '👤' : '🌿'}
                </div>
                <div>
                  <div className="chat-message-bubble">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, paddingLeft: 4 }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="chat-message assistant">
              <div className="chat-message-avatar">🌿</div>
              <div className="chat-message-bubble">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input-field"
              placeholder="Ask me anything about farming..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={sending}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              title="Send message"
            >
              ➤
            </button>
          </div>
          {activeSession && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
              🧠 Memory active — {messages.length} messages in context
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
