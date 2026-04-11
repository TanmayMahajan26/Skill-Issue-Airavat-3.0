'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Scale, AlertTriangle, FileText, TrendingDown } from 'lucide-react';

export default function SuretyPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (user?.role === 'paralegal') {
        params.set('paralegal_id', user.id);
      } else if (user?.role === 'lawyer') {
        params.set('lawyer_id', user.id);
      }
      
      const data = await fetchAPI(`/api/v1/surety/gap-report?${params.toString()}`);
      if (data?.cases) {
        setGaps(data.cases);
      }
      setLoading(false);
    }
    if (user) load();
  }, [user]);

  if (loading) {
    return <div className="space-y-4"><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-7 w-16" /></div>)}</div><div className="glass-card p-5"><div className="skeleton h-60" /></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Unexecuted Surety Cases', value: gaps.length, color: 'text-jg-red', icon: AlertTriangle },
          { label: 'Avg Surety Amount', value: `₹${Math.round(gaps.reduce((s, g) => s + (g.surety_amount || 0), 0) / (gaps.length || 1)).toLocaleString()}`, color: 'text-jg-amber', icon: Scale },
          { label: 'Avg Income Ratio', value: `${(gaps.reduce((s, g) => s + (g.income_ratio || 0), 0) / (gaps.length || 1)).toFixed(1)}×`, color: 'text-jg-purple', icon: TrendingDown },
          { label: 'S.440 Candidates', value: gaps.filter(g => (g.income_ratio || 0) > 10).length, color: 'text-jg-blue', icon: FileText },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-jg-text-secondary">{s.label}</p>
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Gap Report Table */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <Scale className="w-4 h-4 text-jg-amber" /> Surety Gap Report — Bail Granted but Unexecuted
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jg-border text-left">
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">Case</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">Accused</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Surety</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Income/mo</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Ratio</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Days Since</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {gaps.sort((a, b) => (b.income_ratio || 0) - (a.income_ratio || 0)).map((g) => (
                <tr key={g.case_id} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="text-jg-text font-medium">{g.case_number}</div>
                    <div className="text-[11px] text-jg-text-secondary">{g.court || g.state || ''}</div>
                  </td>
                  <td className="py-3 px-3 text-jg-text-secondary">{g.accused_name}</td>
                  <td className="py-3 px-3 text-right font-bold text-jg-text">₹{(g.surety_amount || 0).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right text-jg-text-secondary">₹{(g.monthly_income || g.district_median_income || 0).toLocaleString()}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`font-bold ${(g.income_ratio || 0) > 10 ? 'text-jg-red' : (g.income_ratio || 0) > 5 ? 'text-jg-amber' : 'text-jg-green'}`}>
                      {(g.income_ratio || 0).toFixed(1)}×
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-jg-text">{g.days_since_bail}d</td>
                  <td className="py-3 px-3">
                    {(g.income_ratio || 0) > 10 ? (
                      <button className="text-[11px] bg-jg-blue/15 text-jg-blue px-3 py-1.5 rounded-lg border border-jg-blue/30 hover:bg-jg-blue/25 transition-colors font-medium">
                        Generate S.440 Brief
                      </button>
                    ) : (
                      <span className="text-[11px] text-jg-text-secondary">{g.action}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
