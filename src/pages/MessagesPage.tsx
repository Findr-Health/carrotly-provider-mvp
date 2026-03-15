// src/pages/MessagesPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, ChevronLeft, AlertTriangle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ||
  'https://fearless-achievement-production.up.railway.app/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('providerToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'patient' | 'provider';
  body: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  patientId: string;
  providerId: string;
  patientName?: string;
  programWeek?: number;
  daysSinceCheckIn?: number;
  renewalDaysOut?: number;
  coachNotes?: string;
  lastMessage?: Message;
  unreadCount?: number;
  messages?: Message[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days === 1) return 'Yesterday';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function contextBarColor(daysSinceCheckIn?: number, renewalDaysOut?: number): string {
  if (renewalDaysOut != null && renewalDaysOut <= 2) return 'text-red-500';
  if (daysSinceCheckIn != null && daysSinceCheckIn >= 7) return 'text-amber-500';
  return 'text-teal-600';
}

// ── Conversation List Item ────────────────────────────────────────────────────

const ConvoRow: React.FC<{
  convo: Conversation;
  active: boolean;
  onClick: () => void;
}> = ({ convo, active, onClick }) => {
  const hasUnread = (convo.unreadCount || 0) > 0;
  const preview = convo.lastMessage?.body || 'No messages yet';
  const ts = convo.lastMessage?.timestamp;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors
        ${active ? 'bg-amber-50 border-l-2 border-l-amber-500' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
              {convo.patientName || 'Patient'}
            </span>
            {hasUnread && (
              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
            )}
          </div>
          {convo.programWeek && (
            <p className="text-xs text-gray-400 mb-0.5">Week {convo.programWeek}</p>
          )}
          <p className="text-xs text-gray-500 truncate">{preview.substring(0, 45)}{preview.length > 45 ? '...' : ''}</p>
        </div>
        {ts && (
          <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{relativeTime(ts)}</span>
        )}
      </div>
    </button>
  );
};

// ── Message Bubble ────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isProvider = msg.senderRole === 'provider';
  return (
    <div className={`flex ${isProvider ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[70%]">
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isProvider
            ? 'bg-teal-600 text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}>
          {msg.body}
        </div>
        <p className={`text-xs text-gray-400 mt-1 ${isProvider ? 'text-right' : 'text-left'}`}>
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

interface MessagesPageProps {
  providerId: string;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({ providerId }) => {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'thread'>('list');
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConvo = convos.find(c => c._id === activeId) || null;

  // ── Fetch conversations ───────────────────────────────────────────────────

  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messaging/conversations?providerId=${providerId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      const list: Conversation[] = Array.isArray(data) ? data : (data.conversations || []);

      // Enrich with enrollment data and filter to only convos with messages
      const enriched = await Promise.all(list.map(async (c) => {
        try {
          // Get last message for preview
          const msgRes = await fetch(
            `${API_URL}/messaging/messages/${c._id}?limit=1`,
            { headers: getAuthHeaders() }
          );
          const msgData = await msgRes.json();
          const msgs: Message[] = Array.isArray(msgData) ? msgData : (msgData.messages || []);
          if (msgs.length === 0) return null; // Filter out empty conversations

          // Try to get enrollment data for context
          let enrollment: any = null;
          try {
            const enrRes = await fetch(
              `${API_URL}/enrollments?providerId=${providerId}&patientId=${c.patientId}`
            );
            const enrData = await enrRes.json();
            enrollment = Array.isArray(enrData) ? enrData[0] : enrData;
          } catch {}

          const now = new Date();
          const lastCheckIn = enrollment?.lastCheckInAt ? new Date(enrollment.lastCheckInAt) : null;
          const renewal = enrollment?.prescriptionRenewalDue ? new Date(enrollment.prescriptionRenewalDue) : null;

          return {
            ...c,
            patientName: enrollment?.memberName || c.patientName || 'Member',
            programWeek: enrollment?.programWeek,
            daysSinceCheckIn: lastCheckIn ? Math.round((now.getTime() - lastCheckIn.getTime()) / 86400000) : undefined,
            renewalDaysOut: renewal ? Math.round((renewal.getTime() - now.getTime()) / 86400000) : undefined,
            coachNotes: enrollment?.coachNotes,
            lastMessage: msgs[msgs.length - 1],
            unreadCount: msgs.filter((m: Message) => m.senderRole === 'patient' && !m.read).length,
          } as Conversation;
        } catch {
          return null;
        }
      }));

      const filtered = enriched.filter(Boolean) as Conversation[];
      // Sort: unread first, then by last message time
      filtered.sort((a, b) => {
        if ((b.unreadCount || 0) !== (a.unreadCount || 0)) return (b.unreadCount || 0) - (a.unreadCount || 0);
        const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
        const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
        return bTime - aTime;
      });

      setConvos(filtered);

      // Auto-select first convo if none selected
      if (!activeId && filtered.length > 0) {
        setActiveId(filtered[0]._id);
      }
    } catch (err) {
      console.error('fetchConvos error:', err);
    }
  }, [providerId, activeId]);

  // ── Fetch messages for active convo ──────────────────────────────────────

  const fetchMessages = useCallback(async (convoId: string) => {
    try {
      const res = await fetch(`${API_URL}/messaging/messages/${convoId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      const msgs: Message[] = Array.isArray(data) ? data : (data.messages || []);
      setMessages(msgs);
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error('fetchMessages error:', err);
    }
  }, []);

  // ── Initial load and polling ──────────────────────────────────────────────

  useEffect(() => {
    fetchConvos();
    const listPoll = setInterval(fetchConvos, 10000);
    return () => clearInterval(listPoll);
  }, [fetchConvos]);

  useEffect(() => {
    if (!activeId) return;
    fetchMessages(activeId);
    setSuggestion('');
    setShowSuggestion(false);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchMessages(activeId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, fetchMessages]);

  // ── Send message ─────────────────────────────────────────────────────────

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setInput('');
    setShowSuggestion(false);
    setSuggestion('');
    try {
      await fetch(`${API_URL}/messaging/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeId,
          body: text,
          senderRole: 'provider',
          senderId: providerId,
        })
      });
      await fetchMessages(activeId);
    } catch (err) {
      console.error('sendMessage error:', err);
    } finally {
      setSending(false);
    }
  };

  // ── Ask Claude for suggestion ─────────────────────────────────────────────

  const askClaude = async () => {
    if (!activeConvo || loadingSuggestion) return;
    const lastPatientMsg = [...messages].reverse().find(m => m.senderRole === 'patient');
    if (!lastPatientMsg) return;

    setLoadingSuggestion(true);
    setShowSuggestion(true);
    setSuggestion('');

    try {
      const res = await fetch(`${API_URL}/ai/reply-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          patientMessage: lastPatientMsg.body,
          patientName: activeConvo.patientName,
          programWeek: activeConvo.programWeek,
          daysSinceCheckIn: activeConvo.daysSinceCheckIn,
          renewalDaysOut: activeConvo.renewalDaysOut,
          coachNotes: activeConvo.coachNotes,
        })
      });
      const data = await res.json();
      setSuggestion(data.suggestion || '');
    } catch (err) {
      console.error('askClaude error:', err);
      setSuggestion('');
      setShowSuggestion(false);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const useSuggestion = () => {
    setInput(suggestion);
    setShowSuggestion(false);
    setSuggestion('');
  };

  // ── Context bar ───────────────────────────────────────────────────────────

  const renderContextBar = () => {
    if (!activeConvo) return null;
    const parts: React.ReactNode[] = [];
    if (activeConvo.programWeek) parts.push(<span key="w">Week {activeConvo.programWeek}</span>);
    if (activeConvo.daysSinceCheckIn != null) {
      const color = activeConvo.daysSinceCheckIn >= 7 ? 'text-amber-600 font-semibold' : 'text-gray-500';
      parts.push(
        <span key="c" className={color}>
          {activeConvo.daysSinceCheckIn === 0 ? 'Checked in today' : `Last check-in ${activeConvo.daysSinceCheckIn}d ago`}
          {activeConvo.daysSinceCheckIn >= 7 && <AlertTriangle className="inline w-3 h-3 ml-1" />}
        </span>
      );
    }
    if (activeConvo.renewalDaysOut != null) {
      const color = activeConvo.renewalDaysOut <= 2 ? 'text-red-500 font-semibold' : activeConvo.renewalDaysOut <= 5 ? 'text-amber-600' : 'text-gray-500';
      parts.push(
        <span key="r" className={color}>
          Rx renewal {activeConvo.renewalDaysOut <= 0 ? 'overdue' : `in ${activeConvo.renewalDaysOut}d`}
          {activeConvo.renewalDaysOut <= 2 && <Clock className="inline w-3 h-3 ml-1" />}
        </span>
      );
    }
    if (parts.length === 0) return null;
    return (
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs flex-wrap">
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-gray-300">·</span>}
            {p}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ── Thread panel ──────────────────────────────────────────────────────────

  const renderThread = () => (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button
          onClick={() => setMobileView('list')}
          className="md:hidden p-1 text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <p className="font-bold text-gray-900 text-sm">{activeConvo?.patientName || 'Patient'}</p>
          {activeConvo?.programWeek && (
            <p className="text-xs text-gray-500">Muscle First · Month 1</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          messages.map(msg => <MessageBubble key={msg._id} msg={msg} />)
        )}
      </div>

      {/* Context bar */}
      {renderContextBar()}

      {/* Claude suggestion */}
      {showSuggestion && (
        <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700">Suggested reply</span>
          </div>
          {loadingSuggestion ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-amber-600">Thinking...</span>
            </div>
          ) : suggestion ? (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed mb-2">{suggestion}</p>
              <div className="flex gap-2">
                <button
                  onClick={useSuggestion}
                  className="text-xs font-semibold px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Use this
                </button>
                <button
                  onClick={() => { setShowSuggestion(false); setSuggestion(''); }}
                  className="text-xs font-semibold px-3 py-1.5 bg-white text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-600">Couldn't generate a suggestion. Try again.</p>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
          placeholder="Message..."
          className="flex-1 text-sm px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-300 bg-gray-50"
        />
        <button
          onClick={askClaude}
          disabled={loadingSuggestion || !messages.some(m => m.senderRole === 'patient')}
          title="Ask Claude for a suggested reply"
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-amber-600 border border-amber-200 rounded-xl hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Claude</span>
        </button>
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sending
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send className="w-4 h-4" />
          }
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          style={{ height: 'calc(100vh - 160px)' }}>
          <div className="flex h-full">

            {/* Conversation list — hidden on mobile when thread is open */}
            <div className={`w-full md:w-72 md:flex flex-col border-r border-gray-200 flex-shrink-0
              ${mobileView === 'thread' ? 'hidden' : 'flex'}`}>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Conversations
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {convos.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-400">No messages yet.</p>
                    <p className="text-xs text-gray-400 mt-1">When your members send you a message, it will appear here.</p>
                  </div>
                ) : (
                  convos.map(c => (
                    <ConvoRow
                      key={c._id}
                      convo={c}
                      active={c._id === activeId}
                      onClick={() => {
                        setActiveId(c._id);
                        setMobileView('thread');
                        setSuggestion('');
                        setShowSuggestion(false);
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Thread panel — hidden on mobile when list is shown */}
            <div className={`flex-1 flex-col h-full
              ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
              {activeId ? renderThread() : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Select a conversation</p>
                    <p className="text-xs text-gray-400 mt-1">Choose from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
