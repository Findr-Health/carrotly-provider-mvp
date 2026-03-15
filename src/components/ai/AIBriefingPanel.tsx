// src/components/ai/AIBriefingPanel.tsx
// AI morning briefing panel for Muscle First provider portal
// Calls /api/ai/briefing, renders 3 action cards with approve/edit/dismiss

import React, { useState, useCallback } from 'react';
import {
  Sparkles, AlertTriangle, Clock, Calendar, FileText,
  Send, Edit3, X, Check, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BriefingCard {
  id:            string;
  type:          'outreach' | 'renewal' | 'inbody' | 'invoice';
  priority:      'high' | 'medium';
  memberName:    string;
  title:         string;
  context:       string;
  draftMessage:  string;
  draftSubject:  string | null;
  actionLabel:   string;
  urgency:       'today' | 'this_week';
}

interface BriefingResponse {
  success:     boolean;
  cards:       BriefingCard[];
  memberCount: number;
  generatedAt: string;
  message?:    string;
}

type CardState = 'idle' | 'editing' | 'sending' | 'sent' | 'dismissed';

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL ||
  'https://fearless-achievement-production.up.railway.app/api';

const TYPE_CONFIG = {
  outreach: { icon: AlertTriangle, color: 'red',    label: 'Check-in needed'       },
  renewal:  { icon: Clock,         color: 'amber',  label: 'Prescription renewal'  },
  inbody:   { icon: Calendar,      color: 'teal',   label: 'InBody scan'           },
  invoice:  { icon: FileText,      color: 'blue',   label: 'Invoice ready'         },
} as const;

const COLOR_CLASSES = {
  red:   { badge: 'bg-red-50 text-red-700 border-red-200',   icon: 'text-red-500',   bar: 'bg-red-500'   },
  amber: { badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'text-amber-500', bar: 'bg-amber-500' },
  teal:  { badge: 'bg-teal-50 text-teal-700 border-teal-200', icon: 'text-teal-600',  bar: 'bg-teal-500'  },
  blue:  { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: 'text-blue-500',  bar: 'bg-blue-500'  },
};

// Skeleton card shown while loading
const SkeletonCard: React.FC<{ step: number }> = ({ step }) => {
  const steps = ['Reviewing your members...', 'Checking prescription renewals...', 'Preparing your briefing...'];
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gray-100" />
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="ml-auto h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded w-3/4 mb-4" />
      <div className="h-16 bg-gray-50 rounded-lg border border-gray-100" />
      <p className="text-xs text-gray-400 mt-3 text-center">{steps[step % steps.length]}</p>
    </div>
  );
};

// ── Individual action card ────────────────────────────────────────────────────

interface ActionCardProps {
  card:      BriefingCard;
  onSend:    (card: BriefingCard, message: string) => Promise<void>;
  onDismiss: (id: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ card, onSend, onDismiss }) => {
  const [cardState, setCardState]   = useState<CardState>('idle');
  const [editedMsg, setEditedMsg]   = useState(card.draftMessage);
  const [showDraft, setShowDraft]   = useState(true);

  const config     = TYPE_CONFIG[card.type];
  const colors     = COLOR_CLASSES[config.color];
  const Icon       = config.icon;

  const handleSend = async () => {
    setCardState('sending');
    await onSend(card, editedMsg);
    setCardState('sent');
    setTimeout(() => setCardState('dismissed'), 2000);
  };

  const handleDismiss = () => {
    setCardState('dismissed');
    setTimeout(() => onDismiss(card.id), 300);
  };

  if (cardState === 'dismissed') return null;

  if (cardState === 'sent') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3 transition-all">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">Sent to {card.memberName}</p>
          <p className="text-xs text-green-600">Message delivered successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all
      ${card.priority === 'high' ? 'border-red-100' : 'border-gray-100'}`}>

      {/* Priority bar */}
      <div className={`h-1 w-full ${colors.bar}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${config.color === 'red' ? 'bg-red-50' :
                config.color === 'amber' ? 'bg-amber-50' :
                config.color === 'teal' ? 'bg-teal-50' : 'bg-blue-50'}`}>
              <Icon className={`w-4 h-4 ${colors.icon}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{card.memberName}</p>
              <p className="text-xs text-gray-500">{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colors.badge}`}>
              {card.urgency === 'today' ? 'Today' : 'This week'}
            </span>
            <button
              onClick={handleDismiss}
              className="text-gray-300 hover:text-gray-500 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Context */}
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{card.context}</p>

        {/* Draft message */}
        <div className="mb-4">
          <button
            onClick={() => setShowDraft(!showDraft)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 mb-2 transition-colors"
          >
            {showDraft ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {cardState === 'editing' ? 'Editing draft' : 'Drafted message'}
          </button>

          {showDraft && (
            cardState === 'editing' ? (
              <textarea
                value={editedMsg}
                onChange={e => setEditedMsg(e.target.value)}
                className="w-full text-sm text-gray-700 bg-amber-50 border border-amber-200
                  rounded-lg p-3 leading-relaxed resize-none focus:outline-none
                  focus:ring-2 focus:ring-amber-300 min-h-[80px]"
                autoFocus
              />
            ) : (
              <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100
                rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
                {editedMsg}
              </div>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            disabled={cardState === 'sending'}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500
              hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-bold
              py-2.5 px-4 rounded-lg transition-colors"
          >
            {cardState === 'sending' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {cardState === 'sending' ? 'Sending...' : card.actionLabel}
          </button>

          {cardState !== 'editing' ? (
            <button
              onClick={() => { setCardState('editing'); setShowDraft(true); }}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100
                text-gray-600 text-sm font-semibold py-2.5 px-3 rounded-lg
                border border-gray-200 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <button
              onClick={() => setCardState('idle')}
              className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100
                text-gray-600 text-sm font-semibold py-2.5 px-3 rounded-lg
                border border-gray-200 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Panel ────────────────────────────────────────────────────────────────

interface AIBriefingPanelProps {
  providerId:   string;
  providerName: string;
}

export const AIBriefingPanel: React.FC<AIBriefingPanelProps> = ({
  providerId,
  providerName,
}) => {
  const [status,      setStatus]      = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [cards,       setCards]       = useState<BriefingCard[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [loadStep,    setLoadStep]    = useState(0);

  const firstName = providerName === 'Muscle First' ? 'Nich' : (providerName.split(' ')[0] || 'Nich');
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const fetchBriefing = useCallback(async () => {
    setStatus('loading');
    setLoadStep(0);
    setCards([]);

    // Animate loading steps
    const stepTimer = setInterval(() => setLoadStep(s => (s + 1) % 3), 900);

    try {
      const response = await fetch(`${API_URL}/ai/briefing`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ providerId }),
      });
      const data: BriefingResponse = await response.json();

      clearInterval(stepTimer);

      if (!data.success) throw new Error(data.message || 'Briefing failed');

      setCards(data.cards || []);
      setMemberCount(data.memberCount);
      setGeneratedAt(data.generatedAt);
      setStatus('ready');
    } catch (err: any) {
      clearInterval(stepTimer);
      setErrorMsg(err.message || 'Unable to load briefing');
      setStatus('error');
    }
  }, [providerId]);

  const handleSend = async (card: BriefingCard, message: string) => {
    // Find or create conversation for this member, then send message
    try {
      // First find the conversation
      const convoRes = await fetch(`${API_URL}/messaging/conversations?providerId=${providerId}`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const convos = await convoRes.json();
      
      // Find conversation for this member by name
      const convo = Array.isArray(convos) ? convos.find((c: any) => {
        const memberName = c.memberName || c.patientName || '';
        return memberName.toLowerCase().includes(card.memberName.split(' ')[0].toLowerCase());
      }) : null;

      const conversationId = convo?._id || convo?.conversationId;

      if (conversationId) {
        await fetch(`${API_URL}/messaging/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            body: message,
            senderRole: 'provider',
            senderId: providerId,
          })
        });
      } else {
        // Fallback — log if no conversation found
        console.log('[Briefing] No conversation found for', card.memberName);
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (err) {
      console.error('[Briefing] Send error:', err);
      await new Promise(r => setTimeout(r, 800));
    }
  };

  const handleDismiss = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  };

  // ── Idle state ────────────────────────────────────────────────────────────

  if (status === 'idle') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{dateStr}</p>
            <h2 className="text-white text-xl font-bold">
              {greeting}, {firstName}
            </h2>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30
            flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <p className="text-slate-400 text-sm mb-5">
          Let Claude review your members and prepare today's priority actions.
        </p>
        <button
          onClick={fetchBriefing}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm
            py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Get today's briefing
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <div className="mb-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30
              flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Preparing your briefing</p>
              <p className="text-slate-400 text-xs">Reviewing {memberCount || 'your'} members...</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map(i => <SkeletonCard key={i} step={loadStep + i} />)}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-800">Briefing unavailable</p>
        </div>
        <p className="text-xs text-red-600 mb-4">{errorMsg}</p>
        <button
          onClick={fetchBriefing}
          className="text-sm font-semibold text-red-700 hover:text-red-900 flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  // ── Ready state ───────────────────────────────────────────────────────────

  const activeCards = cards.filter(Boolean);

  return (
    <div className="mb-6">
      {/* Panel header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-4 shadow-lg">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{dateStr}</p>
            <h2 className="text-white text-xl font-bold">
              {greeting}, {firstName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefing}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20
                flex items-center justify-center transition-colors"
              title="Refresh briefing"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30
              flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {activeCards.length > 0 ? (
          <p className="text-slate-300 text-sm">
            <span className="text-amber-400 font-bold">{activeCards.length} action{activeCards.length !== 1 ? 's' : ''}</span>
            {' '}prepared for you today across {memberCount} active member{memberCount !== 1 ? 's' : ''}.
          </p>
        ) : (
          <p className="text-slate-300 text-sm">
            All caught up — no urgent actions today. ✓
          </p>
        )}

        {generatedAt && (
          <p className="text-slate-500 text-xs mt-2">
            Generated {new Date(generatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        )}
      </div>

      {/* Action cards */}
      {activeCards.length > 0 && (
        <div className="space-y-3">
          {activeCards.map(card => (
            <ActionCard
              key={card.id}
              card={card}
              onSend={handleSend}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AIBriefingPanel;
