'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MessageSquare, X, Send, Bot, Phone, Globe, Scale } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'system' | 'user';
  text: string;
  isTyping?: boolean;
}

interface QuickReply {
  id: string;
  label: string;
  prompt: string;
  icon: string;
}

const PERSONA_CONFIGS = {
  lawyer: {
    welcome: "⚖️ Hon'ble Counsel, welcome back. You have 3 cases flagged for legal opinion and 5 S.479 eligible cases awaiting petition drafting. How may I assist your review?",
    replies: [
      { id: 'flagged', label: 'Flagged Cases', prompt: 'Show cases needing my opinion', icon: '🚨' },
      { id: 'drafts', label: 'Draft Petitions', prompt: 'Help me draft a petition', icon: '📝' },
      { id: 's479', label: 'S.479 Rules', prompt: 'Summarize Section 479 applicability', icon: '⚖️' },
      { id: 'bail_check', label: 'Bail Parse', prompt: 'Parse a bail checklist', icon: '📄' }
    ]
  },
  paralegal: {
    welcome: "👋 Welcome back! Your priority queue has been updated. 12 cases are S.479 eligible, and 4 cases are overdue. What's our focus today?",
    replies: [
      { id: 'overdue', label: 'Overdue Cases', prompt: 'Show me overdue cases', icon: '⚠️' },
      { id: 'hearings', label: 'Today\'s Court', prompt: 'Show today\'s hearings', icon: '🏛️' },
      { id: 'surety', label: 'Surety Gaps', prompt: 'Show cases with unexecuted surety', icon: '💰' },
      { id: 'drafting', label: 'Auto-Draft', prompt: 'Start auto-drafting applications', icon: '⚡' }
    ]
  },
  utrc: {
    welcome: "🏛️ Welcome. The district intelligence dashboard is live. There are 312 undertrials requiring UTRC committee review across 50 prisons.",
    replies: [
      { id: 'heatmap', label: 'Prison Heatmap', prompt: 'Show me the prison occupancy heatmap', icon: '🗺️' },
      { id: 'nalsa', label: 'NALSA Report', prompt: 'Generate quarterly NALSA report', icon: '📊' },
      { id: 'comparison', label: 'State Data', prompt: 'State-wise comparison', icon: '📈' },
      { id: 'agenda', label: 'Next Agenda', prompt: 'Generate next committee meeting agenda', icon: '📅' }
    ]
  },
  family: {
    welcome: "🙏 नमस्ते। JusticeGrid सहायता में आपका स्वागत है। \nHello. Welcome to JusticeGrid support. \nमैं केस की जानकारी और कानूनी मदद के लिए आपकी सहायता कर सकता हूँ।",
    replies: [
      { id: 'status', label: 'केस की स्थिति / Case Status', prompt: 'What is the status of my case?', icon: '🔎' },
      { id: 'hearing', label: 'अगली तारीख / Next Date', prompt: 'When is the next hearing?', icon: '📅' },
      { id: 'bail_info', label: 'जमानत क्या है? / What is Bail?', prompt: 'Please explain what bail means simply.', icon: '❓' },
      { id: 'call', label: 'हेल्पलाइन से बात / Call Helpline', prompt: 'Connect me to the DLSA helpline.', icon: '📞' }
    ]
  },
  admin: {
    welcome: "⚙️ System Admin session active. Federation nodes are online. All ML services responding.",
    replies: [
      { id: 'health', label: 'System Health', prompt: 'Check API latency and uptime', icon: '🫀' },
      { id: 'logs', label: 'Audit Logs', prompt: 'View recent security events', icon: '📋' },
      { id: 'fed', label: 'Federation', prompt: 'Check DLSA node synchronization', icon: '🌐' }
    ]
  },
  supervisor: {
    welcome: "🛡️ Supervisor dashboard active. 2 paralegals have overdue priority cases.",
    replies: [
      { id: 'workload', label: 'Workload', prompt: 'Show paralegal workload distribution', icon: '👥' },
      { id: 'audits', label: 'Decision Audits', prompt: 'Review recent AI overrides', icon: '🔍' },
      { id: 'analytics', label: 'Analytics', prompt: 'Open main analytics board', icon: '📊' }
    ]
  }
};

const AUTO_RESPONSES: Record<string, string> = {
  'Show cases needing my opinion': "I found 3 cases flagged for lawyer review. Case MH-2024-CR-10042 has a complex charge sheet overlap. Shall I open the case dossier?",
  'Help me draft a petition': "Navigating to the Petition Drafter. S.479 petitions are currently the highest priority. I've pre-selected the most eligible case.",
  'Show me overdue cases': "You have 4 cases past their priority SLA. Case UP-2025-CR-10150 has a hearing tomorrow but no action taken. Opening priority queue...",
  'Show today\'s hearings': "There are 7 hearings today. 2 have a high adjournment probability (>75%). I recommend focusing on S.Raman's bail hearing at Court #4.",
  'Generate quarterly NALSA report': "Compiling data across 50 prisons... The Q2 NALSA report is ready for export. It flags a 14% increase in S.479 eligibles in Maharashtra.",
  'What is the status of my case?': "आपके केस (MH-2024-CR-10001) में आरोपी अभी हिरासत में है। अच्छी खबर - वे जमानत के लिए योग्य हो गए हैं! (Accused is in custody but now eligible for bail!)",
  'When is the next hearing?': "अगली सुनवाई (Next Hearing) 14 अप्रैल 2026 को सेशन कोर्ट में है। हमारे पैरालीगल वहां आपकी मदद करेंगे।",
  'Please explain what bail means simply.': "जमानत (Bail) का मतलब है कि जब तक केस चल रहा है, आरोपी जेल से बाहर रहकर कोर्ट आ सकता है। यह सजा खत्म होना नहीं है।",
  'Connect me to the DLSA helpline.': "मैं आपको मुफ्त कानूनी सहायता (DLSA Helpline - 1516) से जोड़ रहा हूँ। कृपया फोन पर लाइन पर रहें... 📞"
};

export function ChatbotAssistant() {
  const { user, chatOpen, setChatOpen } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const persona = user?.role || 'paralegal';
  // @ts-ignore
  const config = PERSONA_CONFIGS[persona] || PERSONA_CONFIGS.paralegal;
  
  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([
          { id: 'w1', sender: 'system', text: config.welcome }
        ]);
      }, 1000);
    }
  }, [chatOpen, messages.length, config.welcome]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, chatOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let responseText = "I understand. I'm routing you to the relevant dashboard section. Is there anything else you need?";
      if (AUTO_RESPONSES[text]) {
        responseText = AUTO_RESPONSES[text];
      } else {
        const lower = text.toLowerCase();
        if (lower.includes('case') || lower.includes('status')) {
          responseText = "I'm pulling up the case status logs now. Let me highlight the eligible ones.";
        } else if (lower.includes('help')) {
          responseText = "I'm the JusticeGrid AI assistant. You can use the quick chips below or ask me to find cases, draft petitions, or check schedules.";
        }
      }
      setMessages(prev => [...prev, { id: `s-${Date.now()}`, sender: 'system', text: responseText }]);
    }, 1200);
  };

  if (!user) return null;

  return (
    <>
      {!chatOpen && (
        <button 
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-jg-blue text-white flex items-center justify-center shadow-xl hover:bg-jg-blue-light transition-all z-50 animate-bounce-in"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-jg-red rounded-full border-2 border-jg-bg animate-pulse" />
        </button>
      )}

      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] rounded-2xl overflow-hidden z-50 flex flex-col bg-jg-surface border border-jg-border shadow-2xl animate-scale-up text-jg-text">
          <div className="p-4 bg-jg-bg-alt border-b border-jg-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-jg-blue to-jg-purple flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold">{persona === 'family' ? 'Legal Support Line' : 'JusticeGrid AI'}</h3>
                <p className="text-[10px] text-jg-text-secondary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-jg-green inline-block" /> Online
                </p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-jg-text-secondary hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-jg-bg">
            <div className="text-center pb-2"><span className="text-[9px] uppercase tracking-widest text-jg-text-tertiary">Today</span></div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.sender === 'system' ? 'bg-jg-surface border border-jg-border text-jg-text rounded-bl-sm' : 'bg-jg-blue text-white rounded-br-sm'}`}>
                  {msg.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-jg-surface border border-jg-border text-jg-text rounded-xl rounded-bl-sm p-3 w-16 flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 bg-jg-text-secondary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-jg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-jg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} className="h-1" />
          </div>

          <div className="bg-jg-bg px-3 py-2 border-t border-jg-border flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {config.replies.map((reply: QuickReply) => (
              <button 
                key={reply.id} 
                onClick={() => handleSend(reply.prompt)}
                disabled={isTyping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-jg-blue/10 text-jg-blue-light border border-jg-blue/20 hover:bg-jg-blue/20 transition-colors"
              >
                <span>{reply.icon}</span> {reply.label}
              </button>
            ))}
          </div>

          <div className="p-3 bg-jg-bg-alt border-t border-jg-border flex items-center gap-2">
            <input 
              type="text" 
              placeholder={persona === 'family' ? "Ask a question..." : "Ask the intelligence layer..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              className="flex-1 bg-jg-surface border border-jg-border text-sm text-jg-text rounded-lg px-3 py-2 focus:outline-none focus:border-jg-blue"
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${input.trim() && !isTyping ? 'bg-jg-blue text-white hover:bg-jg-blue-light' : 'bg-jg-surface-hover text-jg-text-tertiary cursor-not-allowed'}`}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
