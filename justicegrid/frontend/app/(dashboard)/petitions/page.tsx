'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Zap, Download, Clipboard, Search, FileText, Scale, ChevronDown, Check } from 'lucide-react';

const PETITION_TYPES = [
  {
    id: 's479',
    label: 'S.479 Bail Petition',
    desc: 'For undertrials who have served more than 1/3 (first offender) or 1/2 of maximum sentence. Indefeasible right.',
    color: 'text-jg-green',
    bg: 'bg-jg-green/8 border-jg-green/20',
    eligible: 'ELIGIBLE cases without bail',
  },
  {
    id: 'pr-bond',
    label: 'PR Bond Petition',
    desc: 'For accused with bail granted but surety unexecuted for 30+ days due to poverty.',
    color: 'text-jg-purple',
    bg: 'bg-jg-purple/8 border-jg-purple/20',
    eligible: 'Bail granted + surety unexecuted',
  },
  {
    id: 's440',
    label: 'S.440 Surety Reduction',
    desc: 'When bail surety exceeds 90 days of local MGNREGA wages — filed under Moti Ram v. State.',
    color: 'text-jg-amber',
    bg: 'bg-jg-amber/8 border-jg-amber/20',
    eligible: 'Bail granted + excessive surety',
  },
];

export default function PetitionsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState(PETITION_TYPES[0]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [petitionText, setPetitionText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams({ limit: '200' });
      if (user?.role === 'paralegal') params.set('paralegal_id', user.id);
      else if (user?.role === 'lawyer') params.set('lawyer_id', user.id);
      const data = await fetchAPI(`/api/v1/cases?${params.toString()}`);
      if (data?.cases) setCases(data.cases);
    }
    if (user) load();
  }, [user]);

  // Filter eligible cases based on petition type
  const eligibleCases = cases.filter((c) => {
    if (selectedType.id === 's479') return c.eligibility_status === 'ELIGIBLE' && !c.bail_granted;
    if (selectedType.id === 'pr-bond') return c.bail_granted && !c.surety_executed;
    if (selectedType.id === 's440') return c.bail_granted && c.surety_amount > 0;
    return false;
  }).filter(c =>
    !search || c.case_number?.toLowerCase().includes(search.toLowerCase()) || c.accused_name?.toLowerCase().includes(search.toLowerCase())
  );

  async function generate() {
    if (!selectedCaseId) return;
    setGenerating(true);
    setPetitionText(null);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}`.replace(':8000', ':8001');
      const res = await fetch(`${url}/api/v1/drafts/${selectedType.id}/${selectedCaseId}`);
      if (res.ok) setPetitionText(await res.text());
      else {
        const err = await res.json();
        setPetitionText(`Error: ${err.detail || 'Failed to generate petition'}`);
      }
    } catch { setPetitionText('Error: Cannot connect to server'); }
    setGenerating(false);
  }

  function download() {
    if (!petitionText) return;
    const blob = new Blob([petitionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${selectedType.id}_petition_${selectedCaseId}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* ═══ PETITION TYPE SELECTOR ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {PETITION_TYPES.map((pt, idx) => (
          <button
            key={pt.id}
            onClick={() => { setSelectedType(pt); setSelectedCaseId(''); setPetitionText(null); }}
            className={`glass-card p-5 text-left transition-all animate-slide-up ${
              selectedType.id === pt.id ? 'ring-1 ring-jg-blue/40 border-jg-blue/30' : 'hover:border-jg-border-light'
            }`}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-xl ${pt.bg} border flex items-center justify-center`}>
                <Zap className={`w-4 h-4 ${pt.color}`} />
              </div>
              <span className="text-sm font-semibold text-jg-text">{pt.label}</span>
              {selectedType.id === pt.id && <Check className="w-4 h-4 text-jg-blue ml-auto" />}
            </div>
            <p className="text-[11px] text-jg-text-secondary leading-relaxed">{pt.desc}</p>
            <p className="text-[10px] text-jg-text-tertiary mt-2">Eligible: {pt.eligible}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ LEFT: CASE SELECTOR ═══ */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-jg-blue" /> Select a Case
              <span className="text-[10px] text-jg-text-tertiary ml-auto">{eligibleCases.length} eligible</span>
            </h3>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-jg-text-tertiary" />
              <input
                type="text" placeholder="Filter cases..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-jg-bg border border-jg-border rounded-xl text-xs text-jg-text placeholder:text-jg-text-tertiary"
              />
            </div>

            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {eligibleCases.slice(0, 30).map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCaseId(c.id); setPetitionText(null); }}
                  className={`w-full text-left p-3 rounded-xl transition-all text-[12px] ${
                    selectedCaseId === c.id
                      ? 'bg-jg-blue/10 border border-jg-blue/30'
                      : 'glass-subtle hover:bg-jg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-jg-text">{c.case_number}</span>
                    <span className="text-[10px] text-jg-text-tertiary">{c.detention_days}d</span>
                  </div>
                  <p className="text-[11px] text-jg-text-secondary mt-0.5">{c.accused_name}</p>
                </button>
              ))}
              {eligibleCases.length === 0 && (
                <p className="text-xs text-jg-text-tertiary text-center py-8">No cases eligible for this petition type.</p>
              )}
            </div>

            <button
              onClick={generate}
              disabled={!selectedCaseId || generating}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30 btn-primary"
            >
              {generating ? '⏳ Generating...' : `⚡ Generate ${selectedType.label}`}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT: PETITION PREVIEW ═══ */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="glass-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-jg-text flex items-center gap-2">
                <Scale className="w-4 h-4 text-jg-green" /> Petition Preview
              </h3>
              {petitionText && !petitionText.startsWith('Error') && (
                <div className="flex gap-2">
                  <button onClick={download} className="px-3 py-1 rounded-lg bg-jg-blue/10 border border-jg-blue/20 text-jg-blue-light text-[11px] hover:bg-jg-blue/20 transition-all flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(petitionText!); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className="px-3 py-1 rounded-lg bg-jg-surface-hover text-jg-text text-[11px] hover:bg-jg-border transition-all flex items-center gap-1"
                  >
                    <Clipboard className="w-3 h-3" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {petitionText ? (
              <pre className="flex-1 bg-jg-bg border border-jg-border rounded-xl p-4 text-[11px] text-jg-text font-mono leading-relaxed overflow-y-auto whitespace-pre-wrap max-h-[520px]">
                {petitionText}
              </pre>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Zap className="w-12 h-12 text-jg-text-tertiary mx-auto mb-4 opacity-30" />
                  <p className="text-sm text-jg-text-secondary">Select a case and click Generate</p>
                  <p className="text-[11px] text-jg-text-tertiary mt-1">The petition will auto-fill with case facts, detention math, and legal citations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
