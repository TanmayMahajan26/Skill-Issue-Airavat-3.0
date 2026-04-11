'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CountdownClock } from '@/components/countdown-clock';
import { ReasoningGraph } from '@/components/reasoning-graph';
import { fetchAPI } from '@/lib/api-client';
import { mockCaseQueue, mockReasoningGraph } from '@/lib/mock-data';
import Link from 'next/link';
import {
  ArrowLeft, Scale, Calendar, MapPin, Building, Clock,
  FileText, User, AlertTriangle, CheckCircle, XCircle, TrendingUp,
} from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [caseData, setCaseData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reasoningGraph, setReasoningGraph] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try real API for case detail
      const detail = await fetchAPI(`/api/v1/cases/${caseId}`);
      if (detail) {
        setCaseData({
          case_id: detail.id,
          case_number: detail.case_number,
          accused_name: detail.accused_name,
          charges: detail.charges || [],
          arrest_date: detail.arrest_date,
          detention_days: detail.detention_days,
          eligibility_status: detail.eligibility_status,
          confidence: detail.eligibility_confidence || 0,
          priority_score: detail.priority_score,
          bail_success_probability: detail.bail_success_probability,
          one_line_reason: detail.eligibility_reasoning || 'Pending assessment',
          next_action: detail.bail_granted ? 'Check surety execution' : 'File bail application',
          next_hearing_date: detail.hearings?.find((h: { outcome: string | null }) => !h.outcome)?.date || null,
          countdown: detail.countdown,
          flags: [],
          state: detail.district?.state || detail.prison?.state || '',
          court: detail.court?.name || '',
          prison: detail.prison?.name || '',
          hearings: detail.hearings || [],
          court_info: detail.court,
        });
      } else {
        // Fallback to mock data
        const found = mockCaseQueue.cases.find((c) => c.case_id === caseId) || mockCaseQueue.cases[0];
        setCaseData(found);
      }

      // Try real API for reasoning graph
      const graph = await fetchAPI(`/api/v1/eligibility/cases/${caseId}/reasoning-graph`);
      if (graph?.nodes) {
        setReasoningGraph(graph);
      } else {
        setReasoningGraph(mockReasoningGraph);
      }
      setLoading(false);
    }
    load();
  }, [caseId]);

  const outcomeColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    ADJOURNED: { bg: 'bg-jg-amber/15', text: 'text-jg-amber', icon: <Clock className="w-3 h-3" /> },
    HEARD: { bg: 'bg-jg-blue/15', text: 'text-jg-blue', icon: <CheckCircle className="w-3 h-3" /> },
    BAIL_GRANTED: { bg: 'bg-jg-green/15', text: 'text-jg-green', icon: <CheckCircle className="w-3 h-3" /> },
    BAIL_DENIED: { bg: 'bg-jg-red/15', text: 'text-jg-red', icon: <XCircle className="w-3 h-3" /> },
  };

  if (loading || !caseData) {
    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="skeleton h-4 w-40 mb-4" />
        <div className="glass-card p-5"><div className="skeleton h-6 w-1/3 mb-3" /><div className="skeleton h-4 w-2/3" /></div>
        <div className="glass-card p-5 h-48"><div className="skeleton h-full" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-2 text-jg-text-secondary hover:text-jg-blue text-sm mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Priority Queue
      </Link>

      {/* Header */}
      <div className="glass-card p-5 mb-6 animate-slide-up">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-jg-text">{caseData.case_number}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                caseData.eligibility_status === 'ELIGIBLE' ? 'badge-eligible' :
                caseData.eligibility_status === 'EXCLUDED' ? 'badge-critical' : 'badge-high'
              }`}>
                {caseData.eligibility_status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-jg-text-secondary flex-wrap">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {caseData.accused_name}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {caseData.state}</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {caseData.court}</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {caseData.prison}</span>
            </div>
          </div>
          <CountdownClock days={caseData.countdown?.days} type={caseData.countdown?.type} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility Summary */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-jg-blue" /> Eligibility Assessment
            </h3>
            <p className="text-sm text-jg-text-secondary leading-relaxed mb-4">{caseData.one_line_reason}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-jg-surface-hover/50 rounded-lg p-3">
                <p className="text-[11px] text-jg-text-secondary mb-1">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-jg-bg rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-jg-blue rounded-full" style={{ width: `${caseData.confidence * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-jg-blue">{(caseData.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="bg-jg-surface-hover/50 rounded-lg p-3">
                <p className="text-[11px] text-jg-text-secondary mb-1">Priority Score</p>
                <p className="text-sm font-bold text-jg-amber">{caseData.priority_score?.toFixed(1)}</p>
              </div>
              <div className="bg-jg-surface-hover/50 rounded-lg p-3">
                <p className="text-[11px] text-jg-text-secondary mb-1">Detained</p>
                <p className="text-sm font-bold text-jg-text">{caseData.detention_days} days</p>
              </div>
              <div className="bg-jg-surface-hover/50 rounded-lg p-3">
                <p className="text-[11px] text-jg-text-secondary mb-1">Arrest Date</p>
                <p className="text-sm font-bold text-jg-text">{caseData.arrest_date}</p>
              </div>
            </div>
          </div>

          {/* Reasoning Graph */}
          {reasoningGraph && (
            <div className="animate-slide-up" style={{ animationDelay: '160ms' }}>
              <ReasoningGraph nodes={reasoningGraph.nodes} edges={reasoningGraph.edges} />
            </div>
          )}

          {/* Charges */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-jg-purple" /> Charges
            </h3>
            <div className="space-y-2">
              {caseData.charges.map((charge: { section: string; act: string; description: string; max_years: number; life_or_death: boolean }, idx: number) => (
                <div key={idx} className="flex items-center justify-between bg-jg-surface-hover/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-jg-purple bg-jg-purple/15 px-2.5 py-1 rounded border border-jg-purple/30">
                      S.{charge.section}
                    </span>
                    <div>
                      <p className="text-sm text-jg-text">{charge.description}</p>
                      <p className="text-[11px] text-jg-text-secondary">{charge.act}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-jg-text">
                      {charge.life_or_death ? 'Life/Death' : `${charge.max_years}y max`}
                    </p>
                    {charge.life_or_death && (
                      <span className="text-[10px] text-jg-red flex items-center gap-1 justify-end">
                        <AlertTriangle className="w-3 h-3" /> Excluded
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hearing History Timeline */}
          {caseData.hearings && caseData.hearings.length > 0 && (
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '320ms' }}>
              <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-jg-amber" /> Hearing History ({caseData.hearings.length})
              </h3>
              <div className="relative">
                <div className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-jg-border" />
                <div className="space-y-4">
                  {caseData.hearings.slice(-8).reverse().map((h: { id?: string; date: string; outcome: string | null; judge: string | null }, idx: number) => {
                    const outcome = h.outcome || 'UPCOMING';
                    const oc = outcomeColors[outcome] || { bg: 'bg-jg-blue/15', text: 'text-jg-blue', icon: <Calendar className="w-3 h-3" /> };
                    return (
                      <div key={h.id || idx} className="flex gap-4 pl-0">
                        <div className={`w-9 h-9 rounded-full ${oc.bg} flex items-center justify-center shrink-0 relative z-10 border-2 border-jg-bg`}>
                          <span className={oc.text}>{oc.icon}</span>
                        </div>
                        <div className="flex-1 bg-jg-surface-hover/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-jg-text">{h.date}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${oc.bg} ${oc.text}`}>
                              {(outcome).replace('_', ' ')}
                            </span>
                          </div>
                          {h.judge && <p className="text-[11px] text-jg-text-secondary">{h.judge}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          {/* Next Action */}
          <div className="glass-card p-5 border-l-4 border-l-jg-blue animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-sm font-semibold text-jg-text mb-2">📋 Recommended Action</h3>
            <p className="text-sm text-jg-blue font-medium">{caseData.next_action}</p>
            {caseData.next_hearing_date && (
              <p className="text-[11px] text-jg-text-secondary mt-2">
                Next hearing: {caseData.next_hearing_date}
              </p>
            )}
          </div>

          {/* Bail Success Predictor (Differentiator 3) */}
          {caseData.bail_success_probability != null && (
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '180ms' }}>
              <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-jg-green" /> Bail Success Rate
                <span className="text-[10px] font-normal text-jg-text-secondary bg-jg-surface-hover px-2 py-0.5 rounded-full">
                  Historical
                </span>
              </h3>
              {/* Circular gauge */}
              <div className="flex justify-center mb-3">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#334155" strokeWidth="8" fill="none" />
                    <circle
                      cx="56" cy="56" r="48"
                      stroke={caseData.bail_success_probability >= 0.6 ? '#10B981' : caseData.bail_success_probability >= 0.4 ? '#F59E0B' : '#EF4444'}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${caseData.bail_success_probability * 301.6} 301.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-jg-text">
                      {(caseData.bail_success_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-jg-text-secondary text-center">
                Based on historical grant rates at {caseData.court} for S.{caseData.charges[0]?.section} {caseData.charges[0]?.act}
              </p>
              <div className="mt-3 p-2 bg-jg-amber/10 rounded-lg border border-jg-amber/20">
                <p className="text-[10px] text-jg-amber text-center">
                  ⚠️ Historical data only — not a prediction of outcome
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '260ms' }}>
            <h3 className="text-sm font-semibold text-jg-text mb-3">⚡ Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Mark as Acted On', color: 'bg-jg-green hover:bg-jg-green/90', action: 'acted_on' },
                { label: 'Flag for Lawyer', color: 'bg-jg-amber hover:bg-jg-amber/90', action: 'flagged' },
                { label: 'Override Assessment', color: 'bg-jg-purple hover:bg-jg-purple/90', action: 'overrode' },
                { label: 'Add Note', color: 'bg-jg-surface-hover hover:bg-jg-border', action: 'add_note' },
              ].map((act) => (
                <button
                  key={act.label}
                  onClick={async () => {
                    await fetchAPI(`/api/v1/cases/${caseId}/action`, {
                      method: 'POST',
                      body: JSON.stringify({ type: act.action, reason: act.label, paralegal_id: 'demo' }),
                    });
                    alert(`Action "${act.label}" recorded!`);
                  }}
                  className={`w-full text-sm text-white py-2 rounded-lg font-medium transition-colors ${act.color}`}
                >
                  {act.label}
                </button>
              ))}
            </div>
          </div>

          {/* Court Info */}
          {caseData.court_info && (
            <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '340ms' }}>
              <h3 className="text-sm font-semibold text-jg-text mb-3">🏛️ Court Statistics</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-jg-text-secondary">Adjournment Rate</span><span className="text-jg-amber font-medium">{(caseData.court_info.adj_rate * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-jg-text-secondary">Bail Grant Rate</span><span className="text-jg-green font-medium">{(caseData.court_info.bail_rate * 100).toFixed(0)}%</span></div>
                <div className="flex justify-between"><span className="text-jg-text-secondary">Avg Bail Decision</span><span className="text-jg-text font-medium">{caseData.court_info.avg_bail_days}d</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
