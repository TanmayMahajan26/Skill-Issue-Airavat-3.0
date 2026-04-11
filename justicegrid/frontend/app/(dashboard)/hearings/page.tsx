'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { mockHearings } from '@/lib/mock-data';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

function getAdjournmentColor(prob: number) {
  if (prob >= 0.75) return { color: 'text-jg-red', bg: 'bg-jg-red/15', border: 'border-jg-red/30', label: 'Very High' };
  if (prob >= 0.5) return { color: 'text-jg-amber', bg: 'bg-jg-amber/15', border: 'border-jg-amber/30', label: 'Moderate' };
  return { color: 'text-jg-green', bg: 'bg-jg-green/15', border: 'border-jg-green/30', label: 'Low' };
}

export default function HearingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hearings, setHearings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAPI('/api/v1/hearings/upcoming?limit=20');
      if (data?.hearings) {
        setHearings(data.hearings);
      } else {
        setHearings(mockHearings);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-4 w-1/3 mb-2" /><div className="skeleton h-3 w-2/3" /></div>)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming Hearings', value: hearings.length, color: 'text-jg-blue' },
          { label: 'High Adjournment Risk', value: hearings.filter((h) => (h.adjournment_prob || h.adjournment_predicted_prob || 0) >= 0.75).length, color: 'text-jg-red' },
          { label: 'Charge Sheet Filed', value: hearings.filter((h) => h.charge_sheet_filed).length, color: 'text-jg-green' },
        ].map((s, i) => (
          <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-xs text-jg-text-secondary mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Hearing Cards */}
      <div className="space-y-3">
        {hearings.map((h, i) => {
          const prob = h.adjournment_prob || h.adjournment_predicted_prob || 0;
          const adj = getAdjournmentColor(prob);
          return (
            <div key={h.id || i} className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: `${(i + 3) * 60}ms` }}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-jg-blue" />
                    <span className="text-sm font-bold text-jg-text">{h.hearing_date || h.date}</span>
                    <span className="text-xs text-jg-text-secondary">•</span>
                    <span className="text-xs text-jg-text-secondary">{h.case_number || ''}</span>
                    <span className="text-xs text-jg-text-secondary">•</span>
                    <span className="text-xs text-jg-text-secondary">{h.accused_name || ''}</span>
                  </div>
                  <p className="text-xs text-jg-text-secondary">{h.court || ''} — {h.judge || h.judge_name || ''}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px]">
                    {h.charge_sheet_filed ? (
                      <span className="flex items-center gap-1 text-jg-green"><CheckCircle className="w-3 h-3" /> Charge sheet filed</span>
                    ) : (
                      <span className="flex items-center gap-1 text-jg-amber"><AlertTriangle className="w-3 h-3" /> Charge sheet pending</span>
                    )}
                  </div>
                </div>

                {/* Adjournment Gauge */}
                <div className="flex items-center gap-3">
                  <div className={`text-center px-4 py-2 rounded-lg ${adj.bg} border ${adj.border}`}>
                    <div className={`text-lg font-bold ${adj.color}`}>{(prob * 100).toFixed(0)}%</div>
                    <div className="text-[10px] text-jg-text-secondary">Adj. Prob.</div>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" stroke="#334155" strokeWidth="4" fill="none" />
                      <circle
                        cx="32" cy="32" r="28"
                        stroke={prob >= 0.75 ? '#EF4444' : prob >= 0.5 ? '#F59E0B' : '#10B981'}
                        strokeWidth="4" fill="none"
                        strokeDasharray={`${prob * 175.9} 175.9`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-[10px] font-bold ${adj.color}`}>{adj.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {prob >= 0.75 && (
                <div className="mt-3 p-2.5 bg-jg-amber/10 rounded-lg border border-jg-amber/20">
                  <p className="text-[11px] text-jg-amber flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    ⚠️ {(prob * 100).toFixed(0)}% adjournment probability — consider reprioritizing
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
