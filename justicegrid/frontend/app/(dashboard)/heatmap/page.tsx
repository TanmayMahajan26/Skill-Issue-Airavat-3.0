'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchAPI } from '@/lib/api-client';
import { mockPrisonHeatmap } from '@/lib/mock-data';
import { Info } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/prison-map'), { ssr: false, loading: () => <div className="w-full h-[600px] skeleton rounded-xl" /> });

export default function HeatmapPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [prisons, setPrisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAPI('/api/v1/analytics/prison-heatmap');
      if (data?.prisons) {
        setPrisons(data.prisons);
      } else {
        setPrisons(mockPrisonHeatmap.prisons);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-7 w-16" /></div>)}</div><div className="glass-card p-5"><div className="skeleton h-[500px]" /></div></div>;
  }

  const totalEligible = prisons.reduce((s, p) => s + p.eligible_count, 0);
  const totalPrisoners = prisons.reduce((s, p) => s + p.total_count, 0);
  const avgPct = totalPrisoners > 0 ? ((totalEligible / totalPrisoners) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Eligible But Unserved', value: totalEligible.toLocaleString(), color: 'text-jg-red' },
          { label: 'Total Undertrial Pop.', value: totalPrisoners.toLocaleString(), color: 'text-jg-blue' },
          { label: 'Avg Eligible %', value: `${avgPct}%`, color: 'text-jg-amber' },
        ].map((s, i) => (
          <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-xs text-jg-text-secondary mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-jg-text flex items-center gap-2">
            🗺️ Prison Heatmap — Eligible-but-Unserved Density
            <span className="text-[10px] font-normal text-jg-text-secondary bg-jg-surface-hover px-2 py-0.5 rounded-full">Differentiator 5</span>
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-jg-text-secondary">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-jg-red inline-block" /> High (&gt;200)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-jg-amber inline-block" /> Medium (100-200)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-jg-green inline-block" /> Low (&lt;100)</span>
          </div>
        </div>
        <MapComponent prisons={prisons} />
      </div>

      {/* Prison Table */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-jg-blue" /> Prison-Level Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jg-border text-left">
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">Prison</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium">State</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Eligible</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">Total</th>
                <th className="py-2 px-3 text-xs text-jg-text-secondary font-medium text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {[...prisons].sort((a, b) => b.eligible_count - a.eligible_count).map((p) => {
                const pct = ((p.eligible_count / p.total_count) * 100).toFixed(1);
                return (
                  <tr key={p.id} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                    <td className="py-2.5 px-3 text-jg-text font-medium">{p.name}</td>
                    <td className="py-2.5 px-3 text-jg-text-secondary">{p.state}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold ${p.eligible_count > 200 ? 'text-jg-red' : p.eligible_count > 100 ? 'text-jg-amber' : 'text-jg-green'}`}>
                        {p.eligible_count}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-jg-text-secondary">{p.total_count}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-jg-text">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
