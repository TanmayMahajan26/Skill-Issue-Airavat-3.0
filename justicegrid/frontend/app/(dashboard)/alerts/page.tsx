'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { AlertTriangle, Shield, FileText, ChevronRight, Filter } from 'lucide-react';

const ALERT_META: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string; desc: string }> = {
  DEFAULT_BAIL: {
    label: 'Default Bail (S.187)',
    icon: AlertTriangle,
    color: 'text-jg-red',
    bg: 'bg-jg-red/8 border-jg-red/20',
    desc: 'Charge sheet not filed within 60/90 days — indefeasible right to bail.',
  },
  CUSTODY_OVERLAP: {
    label: 'Ghost Warrant',
    icon: Shield,
    color: 'text-jg-amber',
    bg: 'bg-jg-amber/8 border-jg-amber/20',
    desc: 'Bail granted & surety executed, but accused held on a second FIR.',
  },
  PR_BOND_TRIGGER: {
    label: 'PR Bond Eligible',
    icon: FileText,
    color: 'text-jg-purple',
    bg: 'bg-jg-purple/8 border-jg-purple/20',
    desc: 'Surety unexecuted for 30+ days — accused likely destitute.',
  },
};

export default function AlertsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alerts, setAlerts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [breakdown, setBreakdown] = useState<any>({});
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (user?.role === 'paralegal') params.set('paralegal_id', user.id);
      else if (user?.role === 'lawyer') params.set('lawyer_id', user.id);
      const data = await fetchAPI(`/api/v1/alerts/active?${params.toString()}`);
      if (data) {
        setAlerts(data.alerts || []);
        setBreakdown(data.breakdown || {});
      }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.type === filter);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-5"><div className="skeleton h-4 w-1/3 mb-3" /><div className="skeleton h-3 w-2/3" /></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* ═══ SUMMARY CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.entries(ALERT_META).map(([type, meta], idx) => {
          const Icon = meta.icon;
          const count = type === 'DEFAULT_BAIL' ? breakdown.default_bail
                      : type === 'CUSTODY_OVERLAP' ? breakdown.custody_overlap
                      : breakdown.pr_bond;
          return (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? 'ALL' : type)}
              className={`glass-card p-5 text-left transition-all animate-slide-up
                ${filter === type ? 'ring-1 ring-jg-blue/40' : 'hover:border-jg-border-light'}`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${meta.color}`} />
                <span className={`text-2xl font-bold ${meta.color}`}>{count || 0}</span>
              </div>
              <p className="text-sm font-semibold text-jg-text mb-1">{meta.label}</p>
              <p className="text-[11px] text-jg-text-secondary leading-relaxed">{meta.desc}</p>
            </button>
          );
        })}
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div className="flex items-center gap-2 mb-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
        <Filter className="w-4 h-4 text-jg-text-tertiary" />
        <button
          onClick={() => setFilter('ALL')}
          className={`text-xs px-3 py-1 rounded-lg transition-all ${
            filter === 'ALL' ? 'bg-jg-blue/15 text-jg-blue-light border border-jg-blue/30' : 'text-jg-text-secondary hover:bg-jg-surface-hover'
          }`}
        >All ({alerts.length})</button>
        {Object.entries(ALERT_META).map(([type, meta]) => (
          <button
            key={type}
            onClick={() => setFilter(filter === type ? 'ALL' : type)}
            className={`text-xs px-3 py-1 rounded-lg transition-all ${
              filter === type ? `${meta.bg} ${meta.color} border` : 'text-jg-text-secondary hover:bg-jg-surface-hover'
            }`}
          >{meta.label.split(' (')[0]}</button>
        ))}
      </div>

      {/* ═══ ALERT LIST ═══ */}
      <div className="space-y-2">
        {filtered.map((alert, i) => {
          const meta = ALERT_META[alert.type] || ALERT_META.DEFAULT_BAIL;
          const Icon = meta.icon;
          return (
            <Link
              key={i}
              href={`/cases/${alert.case_id}`}
              className={`glass-card-hover p-4 flex items-start gap-4 block animate-slide-up`}
              style={{ animationDelay: `${280 + i * 30}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl ${meta.bg} border flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-jg-text">{alert.case_number}</span>
                  <span className="text-xs text-jg-text-secondary">• {alert.accused_name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                    alert.severity === 'CRITICAL' ? 'bg-jg-red/15 text-jg-red'
                    : alert.severity === 'HIGH' ? 'bg-jg-amber/15 text-jg-amber'
                    : 'bg-jg-blue/15 text-jg-blue-light'
                  }`}>{alert.severity}</span>
                </div>
                <p className="text-[12px] text-jg-text-secondary leading-relaxed">{alert.message}</p>
                <p className="text-[11px] text-jg-blue-light font-medium mt-1.5">→ {alert.action}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-jg-text-tertiary shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Shield className="w-12 h-12 text-jg-green mx-auto mb-4 opacity-40" />
          <p className="text-jg-text-secondary text-sm">No active alerts. All cases are within safe parameters.</p>
        </div>
      )}
    </div>
  );
}
