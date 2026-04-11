'use client';
import { useEffect, useState } from 'react';
import { CountdownClock } from '@/components/countdown-clock';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  ChevronRight, Search, AlertTriangle, Users, CheckCircle, Clock,
  Calendar, TrendingUp, Zap, Shield,
} from 'lucide-react';

function getPriorityBadge(score: number) {
  if (score >= 90) return { label: 'CRITICAL', class: 'badge-critical' };
  if (score >= 70) return { label: 'HIGH', class: 'badge-high' };
  if (score >= 50) return { label: 'MEDIUM', class: 'badge-medium' };
  return { label: 'LOW', class: 'badge-low' };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ELIGIBLE': return 'badge-eligible';
    case 'EXCLUDED': return 'badge-critical';
    default: return 'badge-high';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PriorityQueuePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alertBreakdown, setAlertBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      const params = new URLSearchParams({ limit: '50' });
      if (user?.role === 'paralegal') params.set('paralegal_id', user.id);
      else if (user?.role === 'lawyer') params.set('lawyer_id', user.id);

      const [caseData, alertData] = await Promise.all([
        fetchAPI(`/api/v1/cases/queue?${params.toString()}`),
        fetchAPI(`/api/v1/alerts/active?${params.toString()}`),
      ]);
      if (caseData?.cases) setCases(caseData.cases);
      if (alertData) setAlertBreakdown(alertData);
      setLoading(false);
    }
    if (user) loadData();
  }, [user]);

  const filteredCases = cases.filter(
    (c) => c.case_number.toLowerCase().includes(search.toLowerCase()) ||
           c.accused_name.toLowerCase().includes(search.toLowerCase())
  );

  const eligible = cases.filter((c) => c.eligibility_status === 'ELIGIBLE').length;
  const overdue = cases.filter((c) => c.countdown?.type === 'overdue').length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-5"><div className="skeleton h-3 w-20 mb-3" /><div className="skeleton h-8 w-14" /></div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4"><div className="skeleton h-4 w-1/3 mb-3" /><div className="skeleton h-3 w-2/3" /></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ═══ HERO STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Cases',      value: cases.length,                     icon: Users,         color: 'text-jg-blue-light', glow: 'stat-card-blue' },
          { label: 'Bail Eligible',    value: eligible,                          icon: CheckCircle,   color: 'text-jg-green',      glow: 'stat-card-green' },
          { label: 'Overdue',          value: overdue,                           icon: Clock,         color: 'text-jg-red',        glow: 'stat-card-red' },
          { label: 'Default Bail',     value: alertBreakdown?.breakdown?.default_bail || 0,  icon: AlertTriangle, color: 'text-jg-amber',      glow: 'stat-card-amber' },
          { label: 'PR Bond Needed',   value: alertBreakdown?.breakdown?.pr_bond || 0,      icon: Shield,        color: 'text-jg-purple',     glow: 'stat-card-purple' },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`glass-card p-4 ${stat.glow} animate-slide-up`} style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-jg-text-secondary font-medium uppercase tracking-wider">{stat.label}</p>
                <Icon className={`w-4 h-4 ${stat.color} opacity-60`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ═══ QUICK ACTIONS BAR ═══ */}
      <div className="flex items-center gap-3 mb-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Link href="/alerts" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jg-red/8 border border-jg-red/20 text-jg-red text-xs font-medium hover:bg-jg-red/15 transition-all">
          <AlertTriangle className="w-3.5 h-3.5" />
          {alertBreakdown?.total || 0} Alerts
        </Link>
        <Link href="/petitions" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jg-blue/8 border border-jg-blue/20 text-jg-blue-light text-xs font-medium hover:bg-jg-blue/15 transition-all">
          <Zap className="w-3.5 h-3.5" />
          Draft Petition
        </Link>
        <div className="flex-1" />
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-tertiary" />
          <input
            id="case-search"
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-jg-surface border border-jg-border rounded-xl text-[13px]
                       placeholder:text-jg-text-tertiary transition-all text-jg-text"
          />
        </div>
      </div>

      {/* ═══ CASE LIST ═══ */}
      <div className="space-y-2">
        {filteredCases.map((c, i) => {
          const badge = getPriorityBadge(c.priority_score);
          return (
            <Link
              key={c.case_id}
              href={`/cases/${c.case_id}`}
              className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer group block animate-slide-up"
              style={{ animationDelay: `${350 + i * 40}ms` }}
            >
              {/* Priority */}
              <div className={`px-2.5 py-2 rounded-xl text-center shrink-0 min-w-[68px] ${badge.class}`}>
                <div className="text-[9px] font-bold tracking-wider">{badge.label}</div>
                <div className="text-sm font-bold mt-0.5">{c.priority_score?.toFixed(1)}</div>
              </div>

              {/* Case info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-[13px] text-jg-text">{c.case_number}</span>
                  <span className="text-xs text-jg-text-secondary">• {c.accused_name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(c.eligibility_status)}`}>
                    {c.eligibility_status}
                  </span>
                  {c.flags?.includes('LAWYER_REVIEW') && (
                    <span className="text-[10px] badge-high px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Review
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-jg-text-secondary truncate">{c.one_line_reason}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-jg-text-tertiary flex-wrap">
                  <span>📍 {c.state}</span>
                  <span>🏛️ {c.court}</span>
                  <span>📅 {c.detention_days}d</span>
                  {c.confidence > 0 && (
                    <span className="text-jg-blue-light flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {(c.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>

              <CountdownClock days={c.countdown?.days} type={c.countdown?.type} />
              <ChevronRight className="w-4 h-4 text-jg-text-tertiary group-hover:text-jg-blue transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      {filteredCases.length === 0 && !loading && (
        <div className="glass-card p-16 text-center">
          <Search className="w-12 h-12 text-jg-text-tertiary mx-auto mb-4 opacity-40" />
          <p className="text-jg-text-secondary text-sm">No cases found matching &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
