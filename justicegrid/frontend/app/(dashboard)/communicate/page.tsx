'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Phone, Mic, Globe } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
  language?: string;
}

const AUTO_RESPONSES: Record<string, { text: string; language: string }> = {
  'MH-2024-CR-10001': {
    text: '🙏 केस नंबर MH-2024-CR-10001:\n\n👤 नाम: राजेश कुमार\n📋 धारा 379 IPC (चोरी)\n⏰ हिरासत: 412 दिन\n\n✅ स्थिति: आपके परिवार का सदस्य जमानत के लिए योग्य है। 47 दिन से योग्यता सीमा पार हो चुकी है।\n\n📅 अगली सुनवाई: 14 अप्रैल 2026\n🏛️ कोर्ट: सेशन कोर्ट, पुणे\n\nक्या आप कुछ और जानना चाहते हैं?',
    language: 'hi',
  },
  'remand': {
    text: '📖 "रिमांड" का मतलब:\n\nकोर्ट ने अगली सुनवाई तक जेल में रखने का आदेश दिया है। इसका मतलब यह नहीं कि दोषी पाया गया है — सिर्फ कोर्ट अभी और जांच करना चाहता है।\n\n⚖️ यह कानूनी सलाह नहीं है।',
    language: 'hi',
  },
  'bail': {
    text: '📖 "जमानत" (Bail) का मतलब:\n\nआप जेल से बाहर आ सकते हैं, लेकिन कुछ नियमों का पालन करना होगा और कोर्ट बुलाने पर आना होगा। जमानत मिलने के लिए कोर्ट में अर्जी देनी होती है।\n\n⚖️ यह कानूनी सलाह नहीं है।',
    language: 'hi',
  },
};

const LANGUAGES = [
  { code: 'hi', label: 'हिन्दी' },
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'mr', label: 'मराठी' },
  { code: 'te', label: 'తెలుగు' },
];

export default function CommunicatePage() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'ivr' | 'log'>('whatsapp');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'whatsapp' as const, label: '💬 WhatsApp Simulator', desc: 'Differentiator 4' },
          { id: 'ivr' as const, label: '📞 IVR Demo', desc: 'Voice' },
          { id: 'log' as const, label: '📋 Notification Log', desc: '' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-jg-blue/15 text-jg-blue border border-jg-blue/30'
                : 'text-jg-text-secondary hover:bg-jg-surface-hover border border-transparent'
            }`}
          >
            {tab.label}
            {tab.desc && <span className="text-[9px] ml-1 opacity-60">{tab.desc}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'whatsapp' && <WhatsAppSimulator />}
      {activeTab === 'ivr' && <IVRSimulator />}
      {activeTab === 'log' && <NotificationLog />}
    </div>
  );
}

function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'w1',
      sender: 'system',
      text: '🙏 नमस्ते! JusticeGrid में आपका स्वागत है।\n\nकृपया अपना केस नंबर डालें (उदा: MH-2024-CR-10001)\n\nWelcome! Please enter your case number.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'hi',
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('hi');
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', text: input, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput('');

    // Try real API first
    try {
      const { fetchAPI } = await import('@/lib/api-client');
      const apiResp = await fetchAPI('/api/v1/comms/chat-simulate', {
        method: 'POST',
        body: JSON.stringify({ message: userInput, language }),
      });
      if (apiResp?.response_text) {
        const sysMsg: Message = {
          id: `s-${Date.now()}`,
          sender: 'system',
          text: apiResp.response_text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: apiResp.language || language,
        };
        setMessages((prev) => [...prev, sysMsg]);
        return;
      }
    } catch { /* fallback to local */ }

    // Fallback: local auto-response
    setTimeout(() => {
      const inputLower = userInput.toLowerCase().trim();
      let response = AUTO_RESPONSES[userInput.toUpperCase()] || null;

      if (!response) {
        for (const key of Object.keys(AUTO_RESPONSES)) {
          if (inputLower.includes(key.toLowerCase())) {
            response = AUTO_RESPONSES[key];
            break;
          }
        }
      }

      if (!response) {
        if (inputLower.includes('help') || inputLower.includes('samajh nahi') || inputLower.includes('confused')) {
          response = {
            text: '🙏 हम समझते हैं कि यह मुश्किल समय है।\n\nक्या आप DLSA हेल्पलाइन से बात करना चाहते हैं? हम आपको जोड़ सकते हैं।\n\n📞 DLSA Helpline: 1516',
            language: 'hi',
          };
        } else {
          response = {
            text: 'कृपया एक वैध केस नंबर डालें (उदा: MH-2024-CR-10001)\n\nया पूछें:\n• "remand" — रिमांड क्या है?\n• "bail" — जमानत क्या है?\n• "help" — मदद चाहिए',
            language: 'hi',
          };
        }
      }

      const sysMsg: Message = {
        id: `s-${Date.now()}`,
        sender: 'system',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: response.language,
      };
      setMessages((prev) => [...prev, sysMsg]);
    }, 800);
  }

  return (
    <div className="flex gap-6">
      {/* Phone container */}
      <div className="w-[380px] shrink-0 animate-slide-up">
        <div className="rounded-2xl overflow-hidden border-2 border-jg-border bg-jg-bg shadow-2xl">
          {/* WhatsApp header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">⚖️</div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">JusticeGrid</p>
              <p className="text-white/60 text-[10px]">Legal Aid Information</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white/10 text-white text-[10px] rounded px-2 py-1 border-none outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#075E54]">{l.label}</option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-white/60" />
            </div>
          </div>

          {/* Chat area */}
          <div ref={chatRef} className="h-[480px] overflow-y-auto p-3 space-y-2 bg-[#0B141A]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M100 50 L110 60 L100 70 L90 60Z\' fill=\'%23ffffff05\'/%3E%3C/svg%3E")' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#005C4B] text-white rounded-br-none'
                    : 'bg-[#1F2C34] text-white/90 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/40' : 'text-white/30'}`}>{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="bg-[#1F2C34] px-3 py-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-[#2A3942] text-white text-sm rounded-full px-4 py-2 outline-none placeholder:text-white/30"
            />
            <button onClick={sendMessage} className="w-9 h-9 bg-[#00A884] rounded-full flex items-center justify-center hover:bg-[#00C49A] transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Watermark */}
          <div className="bg-jg-amber/10 text-center py-1.5">
            <p className="text-[9px] text-jg-amber">⚠️ SIMULATION — Not a real WhatsApp conversation</p>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="flex-1 space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-jg-text mb-2">💬 WhatsApp Chat Simulator</h3>
          <p className="text-xs text-jg-text-secondary leading-relaxed">
            This demonstrates the family-facing WhatsApp communication flow. In production, this would use Twilio WhatsApp Business API.
          </p>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-jg-text mb-3">Try these:</h3>
          <div className="space-y-2">
            {[
              { input: 'MH-2024-CR-10001', desc: 'Look up a case status' },
              { input: 'remand', desc: '"What does remand mean?"' },
              { input: 'bail', desc: '"What does bail mean?"' },
              { input: 'help', desc: 'Get DLSA helpline connection' },
            ].map((ex) => (
              <button
                key={ex.input}
                onClick={() => { setInput(ex.input); }}
                className="w-full text-left bg-jg-surface-hover/50 rounded-lg p-3 hover:bg-jg-surface-hover transition-colors"
              >
                <p className="text-xs text-jg-blue font-mono">{ex.input}</p>
                <p className="text-[11px] text-jg-text-secondary">{ex.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-l-jg-red">
          <h3 className="text-sm font-semibold text-jg-text mb-2">⚠️ Safety Rules</h3>
          <ul className="text-[11px] text-jg-text-secondary space-y-1">
            <li>❌ Never provides legal advice</li>
            <li>❌ Never predicts case outcomes</li>
            <li>❌ Never stores voice input beyond session</li>
            <li>✅ Opt-in consent required before notifications</li>
            <li>✅ Auto-escalation to DLSA helpline for distressed users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function IVRSimulator() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<any[]>([]);

  // Poll logs periodically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'success') {
      interval = setInterval(async () => {
        try {
          const res = await fetch('http://localhost:8001/api/v1/bolna/logs');
          if (res.ok) {
            const data = await res.json();
            setLogs(data.logs || []);
          }
        } catch (e) {
          console.error('Failed to fetch logs', e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  async function triggerBolnaCall() {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setLoading(true);
    setCallStatus('calling');
    try {
      const res = await fetch('http://localhost:8001/api/v1/bolna/trigger_call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_phone_number: phoneNumber })
      });
      const data = await res.json();
      if (data.success) {
        setCallStatus('success');
      } else {
        setCallStatus('error');
        alert('Call failed: ' + data.error);
      }
    } catch (error) {
      setCallStatus('error');
      alert('Network error connecting to Backend');
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-6">
      <div className="w-[350px] shrink-0 animate-slide-up">
        <div className="glass-card p-6 text-center">
          <div className="bg-jg-bg rounded-xl p-4 mb-4 border border-jg-border">
            <Phone className={`w-12 h-12 mx-auto mb-4 ${callStatus === 'success' ? 'text-jg-green animate-pulse' : 'text-jg-purple'}`} />
            <h3 className="text-lg font-bold text-jg-text mb-2">Bolna AI Agent</h3>
            <p className="text-xs text-jg-text-secondary mb-4">
              Trigger a live conversational AI call directly to your phone.
            </p>
            
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +919876543210"
              className="w-full bg-[#2A3942] text-white text-sm rounded-lg px-4 py-3 outline-none placeholder:text-white/30 border border-jg-border focus:border-jg-purple focus:ring-1 focus:ring-jg-purple mb-4"
              disabled={loading}
            />
            
            <button 
              onClick={triggerBolnaCall} 
              disabled={loading || !phoneNumber}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                callStatus === 'success' ? 'bg-jg-surface-hover text-jg-green border border-jg-green' : 
                'bg-jg-purple hover:bg-jg-purple/80 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? <span className="animate-pulse">Initiating...</span> :
               callStatus === 'success' ? <><Phone className="w-4 h-4" /> Call Triggered</> :
               <><Phone className="w-4 h-4" /> Trigger Call</>}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-jg-text mb-2 flex items-center gap-2"><Globe className="w-4 h-4 text-jg-blue" /> Live Webhook Logs</h3>
          <p className="text-xs text-jg-text-secondary leading-relaxed mb-4">
            Monitoring ngrok tunnel for incoming Bolna webhook payloads. Call status and transcripts will appear below in real-time.
          </p>
          
          <div className="h-[300px] overflow-y-auto bg-jg-bg border border-jg-border rounded-lg p-3 space-y-2">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-jg-text-secondary text-xs">
                {callStatus === 'success' ? 'Waiting for Bolna AI webhooks...' : 'No logs yet.'}
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="bg-jg-surface p-3 rounded text-[11px] font-mono whitespace-pre-wrap overflow-x-auto text-jg-blue-light border-l-2 border-l-jg-purple">
                  {JSON.stringify(log, null, 2)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationLog() {
  const notifications = [
    { id: 'n1', case_number: 'MH-2024-CR-10001', channel: 'WhatsApp', language: 'Hindi', status: 'Delivered', timestamp: '2026-04-11 09:30', content: 'Case status update — eligible for bail' },
    { id: 'n2', case_number: 'UP-2025-CR-10042', channel: 'SMS', language: 'Hindi', status: 'Delivered', timestamp: '2026-04-10 14:15', content: 'Hearing reminder — April 18' },
    { id: 'n3', case_number: 'TN-2024-CR-10089', channel: 'WhatsApp', language: 'Tamil', status: 'Failed', timestamp: '2026-04-10 11:00', content: 'Surety information — S.440 application' },
    { id: 'n4', case_number: 'WB-2024-CR-10200', channel: 'IVR', language: 'Bengali', status: 'Delivered', timestamp: '2026-04-09 16:45', content: 'Case status update' },
    { id: 'n5', case_number: 'BR-2025-CR-10150', channel: 'WhatsApp', language: 'Hindi', status: 'Pending', timestamp: '2026-04-09 09:00', content: 'Next hearing notification' },
  ];

  return (
    <div className="glass-card p-5 animate-slide-up">
      <h3 className="text-sm font-semibold text-jg-text mb-4">📋 Family Notification Log</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jg-border text-left">
              {['Case', 'Channel', 'Language', 'Content', 'Status', 'Timestamp'].map((h) => (
                <th key={h} className="py-2 px-3 text-xs text-jg-text-secondary font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                <td className="py-2.5 px-3 text-jg-text font-medium">{n.case_number}</td>
                <td className="py-2.5 px-3 text-jg-text-secondary">{n.channel}</td>
                <td className="py-2.5 px-3 text-jg-text-secondary">{n.language}</td>
                <td className="py-2.5 px-3 text-jg-text-secondary text-xs">{n.content}</td>
                <td className="py-2.5 px-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    n.status === 'Delivered' ? 'badge-eligible' : n.status === 'Failed' ? 'badge-critical' : 'badge-high'
                  }`}>
                    {n.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-[11px] text-jg-text-secondary">{n.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
