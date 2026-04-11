'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { Building, Users, Clock, AlertTriangle, Download, FileText } from 'lucide-react';

export default function UTRCPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAPI('/api/v1/utrc/dashboard');
      if (data?.summary) {
        setDashboard(data);
      } else {
        // Inline fallback
        setDashboard({
          summary: { total_active: 5000, total_eligible: 1240, total_overdue: 487, total_action_needed: 312, hearings_this_week: 89, total_prisons: 50, avg_detention_days: 342, surety_gap_cases: 387 },
          states: [
            { state: 'Maharashtra', total: 1000, eligible: 280, overdue: 95 },
            { state: 'Uttar Pradesh', total: 1200, eligible: 340, overdue: 142 },
            { state: 'Bihar', total: 900, eligible: 210, overdue: 98 },
            { state: 'Tamil Nadu', total: 800, eligible: 220, overdue: 78 },
            { state: 'West Bengal', total: 1100, eligible: 190, overdue: 74 },
          ],
          top_prisons: [],
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !dashboard) {
    return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-7 w-16" /></div>)}</div></div>;
  }

  const summary = dashboard.summary || {};
  const stats = [
    { label: 'Total Active', value: summary.total_active || 0, color: 'text-jg-blue', icon: Users },
    { label: 'Eligible Cases', value: summary.total_eligible || 0, color: 'text-jg-green', icon: FileText },
    { label: 'Overdue', value: summary.total_overdue || 0, color: 'text-jg-red', icon: AlertTriangle },
    { label: 'Action Needed', value: summary.total_action_needed || 0, color: 'text-jg-amber', icon: Clock },
    { label: 'Hearings This Week', value: summary.hearings_this_week || 0, color: 'text-jg-purple', icon: Clock },
    { label: 'Total Prisons', value: summary.total_prisons || 0, color: 'text-jg-text', icon: Building },
  ];

  return (
    <div className="space-y-6">
      {/* UTRC Header */}
      <div className="glass-card p-5 border-l-4 border-l-jg-green animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-jg-text flex items-center gap-2">
              <Building className="w-5 h-5 text-jg-green" /> UTRC Coordinator Dashboard
            </h2>
            <p className="text-xs text-jg-text-secondary mt-1">Under-Trial Review Committee — State-level overview</p>
          </div>
          <button className="flex items-center gap-2 text-sm bg-jg-green/15 text-jg-green px-4 py-2 rounded-lg border border-jg-green/30 hover:bg-jg-green/25 transition-colors font-medium">
            <Download className="w-4 h-4" /> Export NALSA Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-xs text-jg-text-secondary mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Top Prisons */}
      {dashboard.top_prisons && dashboard.top_prisons.length > 0 && (
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-jg-amber" /> Prison Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboard.top_prisons.map((p: { name: string; eligible: number; total: number; state: string; occupancy: number }, i: number) => (
              <div key={i} className="bg-jg-surface-hover/50 rounded-lg p-4 border border-jg-border/50">
                <p className="text-sm font-semibold text-jg-text mb-1">{p.name}</p>
                <p className="text-[11px] text-jg-text-secondary mb-3">{p.state}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-jg-text-secondary">Eligible</span><span className="text-jg-green font-bold">{p.eligible}</span></div>
                  <div className="flex justify-between"><span className="text-jg-text-secondary">Total Undertrial</span><span className="text-jg-text">{p.total}</span></div>
                  <div className="flex justify-between"><span className="text-jg-text-secondary">Occupancy</span><span className={p.occupancy > 100 ? 'text-jg-red font-bold' : p.occupancy > 1 ? (p.occupancy > 100 ? 'text-jg-red font-bold' : 'text-jg-green') : (p.occupancy > 1 ? 'text-jg-red font-bold' : 'text-jg-green')}>{p.occupancy > 10 ? `${Math.round(p.occupancy)}%` : `${(p.occupancy * 100).toFixed(0)}%`}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* States Breakdown */}
      {dashboard.states && dashboard.states.length > 0 && (
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4">📊 State-wise Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jg-border">
                  <th className="py-2 px-3 text-left text-xs text-jg-text-secondary font-medium">State</th>
                  <th className="py-2 px-3 text-right text-xs text-jg-text-secondary font-medium">Cases</th>
                  <th className="py-2 px-3 text-right text-xs text-jg-text-secondary font-medium">Eligible</th>
                  <th className="py-2 px-3 text-right text-xs text-jg-text-secondary font-medium">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.states.map((s: { state: string; total: number; eligible: number; overdue: number }, i: number) => (
                  <tr key={i} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-jg-text">{s.state}</td>
                    <td className="py-2 px-3 text-right text-jg-text-secondary">{s.total}</td>
                    <td className="py-2 px-3 text-right text-jg-green font-bold">{s.eligible}</td>
                    <td className="py-2 px-3 text-right text-jg-red font-bold">{s.overdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
