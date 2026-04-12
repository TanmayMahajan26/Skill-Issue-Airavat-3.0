'use client';
import { useEffect, useState } from 'react';
import { CountdownClock } from '@/components/countdown-clock';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import {
  ChevronRight, Search, AlertTriangle, Users, CheckCircle, Clock,
  Calendar, TrendingUp, Zap, Shield, Scale, Radio, Map, BarChart3
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

/* ═══════════════════════════════════════════ */
/*                 FAMILY DASHBOARD             */
/* ═══════════════════════════════════════════ */
function FamilyDashboard({ user }: { user: any }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8 animate-slide-down">
        <h1 className="text-2xl font-bold text-jg-text mb-2">नमस्ते, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-jg-text-secondary">हम आपकी सहायता के लिए यहाँ हैं। (We are here to help.)</p>
      </div>

      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center justify-between mb-4 border-b border-jg-border pb-4">
          <div>
            <p className="text-xs text-jg-text-secondary uppercase tracking-widest font-semibold mb-1">Status / स्थिति</p>
            <h2 className="text-xl font-bold text-jg-blue flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-jg-green animate-pulse" />
              Eligible for Bail
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-jg-text-secondary uppercase tracking-widest font-semibold mb-1">Time Served</p>
            <p className="text-xl font-bold text-jg-text">2.4 <span className="text-sm text-jg-text-tertiary">Years</span></p>
          </div>
        </div>
        <p className="text-sm text-jg-text-secondary leading-relaxed bg-jg-bg p-4 rounded-xl border border-jg-border">
          आपके परिवार के सदस्य (MH-2024-CR-10042) ने अपनी अधिकतम सजा का आधा समय पूरा कर लिया है, इसलिए वे <span className="text-jg-green font-semibold">BNSS धारा 479</span> के तहत रिहा होने के योग्य हैं।
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <Link href="/understand-bail" className="glass-card p-5 hover:border-jg-blue/50 transition-colors group">
          <Scale className="w-6 h-6 text-jg-blue mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-jg-text text-sm mb-1">जमानत क्या है?</h3>
          <p className="text-[11px] text-jg-text-secondary">What is Bail?</p>
        </Link>
        <Link href="/help" className="glass-card p-5 hover:border-jg-green/50 transition-colors group">
          <Radio className="w-6 h-6 text-jg-green mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold text-jg-text text-sm mb-1">मदद लें</h3>
          <p className="text-[11px] text-jg-text-secondary">Get Free Help (1516)</p>
        </Link>
      </div>
    </div>
  );
}

export default function PriorityQueuePage() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'family') return <FamilyDashboard user={user} />;
  if (user.role === 'utrc') return <UTRCDashboard />;
  if (user.role === 'supervisor') return <SupervisorDashboard />;
  if (user.role === 'lawyer') return <LawyerDashboard />;
  // admin + paralegal get the main queue
  return <QueueDashboard />;
}

function QueueDashboard() {
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


/* ═══════════════════════════════════════════ */
/*            UTRC COORDINATOR DASHBOARD        */
/* ═══════════════════════════════════════════ */
function UTRCDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prisonData, setPrisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statusDist, districtData, alertData] = await Promise.all([
        fetchAPI('/api/v1/analytics/status-distribution'),
        fetchAPI('/api/v1/analytics/district-comparison'),
        fetchAPI('/api/v1/alerts/active'),
      ]);
      setStats({
        totalCases: statusDist?.total_cases || 0,
        totalEligible: statusDist?.total_eligible || 0,
        avgDetention: statusDist?.avg_detention_days || 0,
        suretyGap: statusDist?.surety_gap_cases || 0,
        alerts: alertData?.total || 0,
        defaultBail: alertData?.breakdown?.default_bail || 0,
        ghostWarrant: alertData?.breakdown?.ghost_warrant || 0,
        prBond: alertData?.breakdown?.pr_bond || 0,
      });
      setPrisonData((districtData?.data || []).slice(0, 12));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-8 w-32" /></div>)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="animate-slide-down">
        <h1 className="text-xl font-bold text-jg-text mb-1">Under-Trial Review Committee</h1>
        <p className="text-sm text-jg-text-secondary">Prison-level oversight of S.479-eligible undertrials. Prepare quarterly NALSA review data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Undertrials', value: stats?.totalCases, color: 'text-jg-blue-light', icon: Users },
          { label: 'S.479 Eligible', value: stats?.totalEligible, color: 'text-jg-green', icon: CheckCircle },
          { label: 'Default Bail (S.187)', value: stats?.defaultBail, color: 'text-jg-amber', icon: AlertTriangle },
          { label: 'Avg Detention (days)', value: stats?.avgDetention, color: 'text-jg-red', icon: Clock },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-jg-text-secondary font-medium uppercase tracking-wider">{s.label}</p>
                <Icon className={`w-4 h-4 ${s.color} opacity-60`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value?.toLocaleString?.() || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Alert Summary */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-jg-amber" /> Action Required — {stats?.alerts} Active Alerts
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-jg-red/8 border border-jg-red/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-red">{stats?.defaultBail}</p>
            <p className="text-[11px] text-jg-text-secondary mt-1">Default Bail</p>
            <p className="text-[10px] text-jg-text-tertiary">Charge sheet &gt;60/90d — indefeasible right</p>
          </div>
          <div className="bg-jg-amber/8 border border-jg-amber/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-amber">{stats?.ghostWarrant}</p>
            <p className="text-[11px] text-jg-text-secondary mt-1">Ghost Warrants</p>
            <p className="text-[10px] text-jg-text-tertiary">Surety cleared but held on second FIR</p>
          </div>
          <div className="bg-jg-purple/8 border border-jg-purple/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-purple">{stats?.prBond}</p>
            <p className="text-[11px] text-jg-text-secondary mt-1">PR Bond Eligible</p>
            <p className="text-[10px] text-jg-text-tertiary">Surety unexecuted 30+ days — destitute</p>
          </div>
        </div>
      </div>

      {/* District Comparison Table */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-jg-green" /> District-Level Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jg-border text-left">
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">District</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Total Cases</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Eligible</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Avg Detention</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Surety Ratio</th>
              </tr>
            </thead>
            <tbody>
              {prisonData.map((d) => (
                <tr key={d.district} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-jg-text">{d.district}</td>
                  <td className="py-2.5 px-3 text-right text-jg-text-secondary">{d.total_cases}</td>
                  <td className="py-2.5 px-3 text-right text-jg-green font-semibold">{d.eligible_count}</td>
                  <td className="py-2.5 px-3 text-right text-jg-text-secondary">{d.avg_detention_days?.toFixed(0)}d</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`font-semibold ${(d.avg_surety_ratio || 0) > 10 ? 'text-jg-red' : 'text-jg-amber'}`}>
                      {d.avg_surety_ratio?.toFixed(1) || '—'}×
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <Link href="/utrc" className="flex-1 glass-card p-4 hover:border-jg-purple/50 transition-colors text-center group">
          <Radio className="w-5 h-5 text-jg-purple mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">UTRC Panel View</p>
          <p className="text-[10px] text-jg-text-tertiary">Full committee review interface</p>
        </Link>
        <Link href="/heatmap" className="flex-1 glass-card p-4 hover:border-jg-blue/50 transition-colors text-center group">
          <Map className="w-5 h-5 text-jg-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Prison Heatmap</p>
          <p className="text-[10px] text-jg-text-tertiary">Geographic density of eligible undertrials</p>
        </Link>
        <Link href="/analytics" className="flex-1 glass-card p-4 hover:border-jg-green/50 transition-colors text-center group">
          <BarChart3 className="w-5 h-5 text-jg-green mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Analytics</p>
          <p className="text-[10px] text-jg-text-tertiary">Charge × detention, court performance</p>
        </Link>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════ */
/*          SUPERVISOR OVERSIGHT DASHBOARD      */
/* ═══════════════════════════════════════════ */
function SupervisorDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [statusDist, alertData, accuracyData] = await Promise.all([
        fetchAPI('/api/v1/analytics/status-distribution'),
        fetchAPI('/api/v1/alerts/active'),
        fetchAPI('/api/v1/analytics/accuracy-tracking'),
      ]);
      setStats({
        totalCases: statusDist?.total_cases || 0,
        totalEligible: statusDist?.total_eligible || 0,
        avgDetention: statusDist?.avg_detention_days || 0,
        suretyGap: statusDist?.surety_gap_cases || 0,
        alerts: alertData?.total || 0,
        defaultBail: alertData?.breakdown?.default_bail || 0,
        ghostWarrant: alertData?.breakdown?.ghost_warrant || 0,
        prBond: alertData?.breakdown?.pr_bond || 0,
        accuracy: accuracyData?.data || [],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-8 w-32" /></div>)}</div>;
  }

  // Latest accuracy
  const latestAcc = stats?.accuracy?.length ? stats.accuracy[stats.accuracy.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="animate-slide-down">
        <h1 className="text-xl font-bold text-jg-text mb-1">DLSA Supervisor — Oversight Dashboard</h1>
        <p className="text-sm text-jg-text-secondary">Monitor paralegal workload, system accuracy, audit trail, and alert escalation.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Undertrials', value: stats?.totalCases, color: 'text-jg-blue-light' },
          { label: 'Pending Alerts', value: stats?.alerts, color: 'text-jg-red' },
          { label: 'Surety Gap Cases', value: stats?.suretyGap, color: 'text-jg-amber' },
          { label: 'S.479 Eligible', value: stats?.totalEligible, color: 'text-jg-green' },
        ].map((s, i) => (
          <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[11px] text-jg-text-secondary font-medium uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value?.toLocaleString?.() || 0}</p>
          </div>
        ))}
      </div>

      {/* System Accuracy Snapshot */}
      {latestAcc && (
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4">🎯 System Accuracy (Latest Week)</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Eligibility Accuracy', value: latestAcc.eligibility_accuracy, color: 'text-jg-green' },
              { label: 'Adjournment Predictor', value: latestAcc.adjournment_accuracy, color: 'text-jg-amber' },
              { label: 'Bail Prediction', value: latestAcc.bail_prediction_accuracy, color: 'text-jg-blue-light' },
            ].map((m) => (
              <div key={m.label} className="bg-jg-bg border border-jg-border rounded-xl p-4 text-center">
                <p className={`text-3xl font-bold ${m.color}`}>{((m.value || 0) * 100).toFixed(0)}%</p>
                <p className="text-[11px] text-jg-text-secondary mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert Categories */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-jg-red" /> Alert Escalation Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-jg-red/8 border border-jg-red/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-red">{stats?.defaultBail}</p>
            <p className="text-[11px] text-jg-text-secondary">Default Bail</p>
          </div>
          <div className="bg-jg-amber/8 border border-jg-amber/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-amber">{stats?.ghostWarrant}</p>
            <p className="text-[11px] text-jg-text-secondary">Ghost Warrants</p>
          </div>
          <div className="bg-jg-purple/8 border border-jg-purple/20 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-jg-purple">{stats?.prBond}</p>
            <p className="text-[11px] text-jg-text-secondary">PR Bond Eligible</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <Link href="/admin/audit" className="flex-1 glass-card p-4 hover:border-jg-amber/50 transition-colors text-center group">
          <Shield className="w-5 h-5 text-jg-amber mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Audit Log</p>
          <p className="text-[10px] text-jg-text-tertiary">Review paralegal actions & overrides</p>
        </Link>
        <Link href="/analytics" className="flex-1 glass-card p-4 hover:border-jg-blue/50 transition-colors text-center group">
          <BarChart3 className="w-5 h-5 text-jg-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Analytics</p>
          <p className="text-[10px] text-jg-text-tertiary">Charge × detention, court performance</p>
        </Link>
        <Link href="/heatmap" className="flex-1 glass-card p-4 hover:border-jg-green/50 transition-colors text-center group">
          <Map className="w-5 h-5 text-jg-green mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Prison Heatmap</p>
          <p className="text-[10px] text-jg-text-tertiary">Geographic view of eligible undertrials</p>
        </Link>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════ */
/*           LAWYER DASHBOARD                   */
/* ═══════════════════════════════════════════ */
function LawyerDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams({ limit: '50' });
      if (user) params.set('lawyer_id', user.id);
      const data = await fetchAPI(`/api/v1/cases/queue?${params.toString()}`);
      if (data?.cases) setCases(data.cases);
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  // Filter: only show cases that need lawyer review
  const flaggedCases = cases.filter(c =>
    c.eligibility_status === 'REVIEW_NEEDED' ||
    c.eligibility_status === 'EXCLUDED' ||
    c.flags?.includes('LAWYER_REVIEW') ||
    c.flags?.includes('NO_LAWYER')
  );
  const routineCases = cases.filter(c => !flaggedCases.includes(c));

  if (loading) {
    return <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="glass-card p-5"><div className="skeleton h-4 w-1/3 mb-2" /><div className="skeleton h-3 w-2/3" /></div>)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="animate-slide-down">
        <h1 className="text-xl font-bold text-jg-text mb-1">NALSA Panel Lawyer — Review Queue</h1>
        <p className="text-sm text-jg-text-secondary">Cases flagged for your legal opinion. Review eligibility, charge exclusions, and bail applications.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Flagged for Review', value: flaggedCases.length, color: 'text-jg-red' },
          { label: 'Assigned Cases', value: cases.length, color: 'text-jg-blue-light' },
          { label: 'Routine (No Action)', value: routineCases.length, color: 'text-jg-green' },
        ].map((s, i) => (
          <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <p className="text-[11px] text-jg-text-secondary font-medium uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Flagged Cases */}
      {flaggedCases.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-jg-red" /> Requires Legal Opinion ({flaggedCases.length})
          </h3>
          <div className="space-y-2">
            {flaggedCases.map((c, i) => {
              const badge = getPriorityBadge(c.priority_score);
              return (
                <Link
                  key={c.case_id}
                  href={`/cases/${c.case_id}`}
                  className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer group block animate-slide-up"
                  style={{ animationDelay: `${300 + i * 40}ms` }}
                >
                  <div className={`px-2.5 py-2 rounded-xl text-center shrink-0 min-w-[68px] ${badge.class}`}>
                    <div className="text-[9px] font-bold tracking-wider">{badge.label}</div>
                    <div className="text-sm font-bold mt-0.5">{c.priority_score?.toFixed(1)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-[13px] text-jg-text">{c.case_number}</span>
                      <span className="text-xs text-jg-text-secondary">• {c.accused_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(c.eligibility_status)}`}>
                        {c.eligibility_status}
                      </span>
                      <span className="text-[10px] badge-high px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Review Needed
                      </span>
                    </div>
                    <p className="text-[12px] text-jg-text-secondary truncate">{c.one_line_reason}</p>
                  </div>
                  <CountdownClock days={c.countdown?.days} type={c.countdown?.type} />
                  <ChevronRight className="w-4 h-4 text-jg-text-tertiary group-hover:text-jg-blue transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <Link href="/petitions" className="flex-1 glass-card p-4 hover:border-jg-blue/50 transition-colors text-center group">
          <Zap className="w-5 h-5 text-jg-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Draft Petition</p>
          <p className="text-[10px] text-jg-text-tertiary">S.479, PR Bond, S.440 petitions</p>
        </Link>
        <Link href="/hearings" className="flex-1 glass-card p-4 hover:border-jg-amber/50 transition-colors text-center group">
          <Calendar className="w-5 h-5 text-jg-amber mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">Hearings</p>
          <p className="text-[10px] text-jg-text-tertiary">Upcoming Court Schedule</p>
        </Link>
        <Link href="/cases" className="flex-1 glass-card p-4 hover:border-jg-green/50 transition-colors text-center group">
          <Users className="w-5 h-5 text-jg-green mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-semibold text-jg-text">All Assigned Cases</p>
          <p className="text-[10px] text-jg-text-tertiary">{cases.length} cases in your panel</p>
        </Link>
      </div>

      {/* Routine cases that don't need review (collapsed) */}
      {routineCases.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <h3 className="text-sm font-semibold text-jg-text-secondary mb-3">
            Routine Cases ({routineCases.length}) — No immediate action needed
          </h3>
          <div className="space-y-1.5 opacity-60">
            {routineCases.slice(0, 5).map((c) => (
              <Link key={c.case_id} href={`/cases/${c.case_id}`} className="glass-subtle p-3 flex items-center gap-3 text-xs rounded-xl hover:bg-jg-surface-hover transition-colors block">
                <span className="font-medium text-jg-text">{c.case_number}</span>
                <span className="text-jg-text-secondary">• {c.accused_name}</span>
                <span className="text-jg-green ml-auto">{c.eligibility_status}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
