'use client';
import { useState } from 'react';
import { ClipboardCheck, Clipboard, Languages, Printer } from 'lucide-react';

const SAMPLE_ORDER = `The accused is hereby granted bail on the following conditions:
1. The accused shall furnish two sureties of Rs. 25,000 each to the satisfaction of the Court.
2. The accused shall surrender their passport to the Court within 7 days.
3. The accused shall report to the local Police Station every Monday between 10 AM and 12 PM.
4. The accused shall not leave the jurisdiction of this Court without prior permission.
5. The accused shall not tamper with evidence or influence prosecution witnesses.
6. The accused shall cooperate with the investigation and appear before the Court on all hearing dates.`;

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  FINANCIAL: { bg: 'bg-jg-amber/10 border-jg-amber/20', text: 'text-jg-amber' },
  REPORTING: { bg: 'bg-jg-blue/10 border-jg-blue/20', text: 'text-jg-blue-light' },
  DOCUMENT: { bg: 'bg-jg-purple/10 border-jg-purple/20', text: 'text-jg-purple' },
  TRAVEL: { bg: 'bg-jg-red/10 border-jg-red/20', text: 'text-jg-red' },
  CONDUCT: { bg: 'bg-jg-green/10 border-jg-green/20', text: 'text-jg-green' },
};

export default function ChecklistPage() {
  const [orderText, setOrderText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [checklist, setChecklist] = useState<any[] | null>(null);
  const [parsing, setParsing] = useState(false);

  async function parse() {
    if (!orderText.trim()) return;
    setParsing(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`;
      const res = await fetch(`${url}/api/v1/bail/parse-conditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_text: orderText }),
      });
      const data = await res.json();
      if (data?.items) setChecklist(data.items);
    } catch { console.error('Parse failed'); }
    setParsing(false);
  }

  function loadSample() {
    setOrderText(SAMPLE_ORDER);
    setChecklist(null);
  }

  function printChecklist() {
    if (!checklist) return;
    const printContent = checklist.map(item =>
      `${item.icon} ${item.condition}\n   ${item.condition_hindi}\n   [${item.category}]\n`
    ).join('\n');
    const w = window.open('', '', 'width=600,height=800');
    if (w) {
      w.document.write(`<html><head><title>Bail Conditions Checklist</title><style>body{font-family:sans-serif;padding:40px;line-height:1.8}h1{font-size:18px}</style></head><body>`);
      w.document.write(`<h1>Bail Conditions Checklist</h1><pre>${printContent}</pre>`);
      w.document.write(`</body></html>`);
      w.document.close();
      w.print();
    }
  }

  return (
    <div>
      {/* ═══ PAGE HEADER ═══ */}
      <div className="glass-card p-6 mb-6 animate-slide-up">
        <h2 className="text-lg font-bold text-jg-text flex items-center gap-2 mb-2">
          <ClipboardCheck className="w-5 h-5 text-jg-green" />
          Bail Condition Checklist Generator
        </h2>
        <p className="text-sm text-jg-text-secondary leading-relaxed max-w-2xl">
          Paste a judge&apos;s bail order text below. The NLP engine extracts conditions into a{' '}
          <span className="text-jg-green font-medium">visual, bilingual checklist</span> (English + Hindi) that
          families and accused can understand — even without legal training.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ LEFT: INPUT ═══ */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-jg-text">Bail Order Text</h3>
              <button
                onClick={loadSample}
                className="text-[11px] text-jg-blue-light hover:text-jg-blue font-medium transition-colors"
              >
                Load Sample Order ↗
              </button>
            </div>
            <textarea
              value={orderText}
              onChange={(e) => { setOrderText(e.target.value); setChecklist(null); }}
              placeholder="Paste the judge's bail order text here..."
              className="w-full h-64 bg-jg-bg border border-jg-border rounded-xl p-4 text-[13px] text-jg-text
                         placeholder:text-jg-text-tertiary focus:outline-none focus:border-jg-blue/50 resize-none leading-relaxed"
            />
            <button
              onClick={parse}
              disabled={!orderText.trim() || parsing}
              className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all btn-primary disabled:opacity-30"
            >
              {parsing ? '⏳ Extracting Conditions...' : '🔍 Extract Conditions'}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT: CHECKLIST OUTPUT ═══ */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="glass-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-jg-text flex items-center gap-2">
                <Languages className="w-4 h-4 text-jg-purple" /> Visual Checklist
              </h3>
              {checklist && checklist.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={printChecklist}
                    className="px-3 py-1 rounded-lg bg-jg-surface-hover text-jg-text text-[11px] hover:bg-jg-border transition-all flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" /> Print
                  </button>
                  <button
                    onClick={() => {
                      const txt = checklist.map(i => `${i.icon} ${i.condition}\n   ${i.condition_hindi}`).join('\n\n');
                      navigator.clipboard.writeText(txt);
                    }}
                    className="px-3 py-1 rounded-lg bg-jg-surface-hover text-jg-text text-[11px] hover:bg-jg-border transition-all flex items-center gap-1"
                  >
                    <Clipboard className="w-3 h-3" /> Copy All
                  </button>
                </div>
              )}
            </div>

            {checklist && checklist.length > 0 ? (
              <div className="space-y-3 flex-1">
                {checklist.map((item, i) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.CONDUCT;
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border ${style.bg} animate-slide-up`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-[13px] text-jg-text font-medium leading-relaxed">{item.condition}</p>
                          <p className="text-[12px] text-jg-text-secondary mt-1">{item.condition_hindi}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold mt-2 inline-block border ${style.bg} ${style.text}`}>
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <ClipboardCheck className="w-12 h-12 text-jg-text-tertiary mx-auto mb-4 opacity-25" />
                  <p className="text-sm text-jg-text-secondary">Paste a bail order and click Extract</p>
                  <p className="text-[11px] text-jg-text-tertiary mt-1">Conditions will appear here in English and Hindi.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
