'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { mockAnalytics } from '@/lib/mock-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, Legend
} from 'recharts';

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Try real API endpoints
      const [chargeDetn, courtPerf, heatmap] = await Promise.all([
        fetchAPI('/api/v1/analytics/charge-detention'),
        fetchAPI('/api/v1/analytics/court-performance'),
        fetchAPI('/api/v1/analytics/prison-heatmap'),
      ]);

      if (chargeDetn || courtPerf) {
        setData({
          chargeDetention: (chargeDetn?.data || chargeDetn || mockAnalytics.chargeDetention).slice(0, 8),
          courtPerformance: (courtPerf?.data || courtPerf || mockAnalytics.courtPerformance).slice(0, 8),
          statusDistribution: mockAnalytics.statusDistribution,
          systemAccuracy: mockAnalytics.systemAccuracy,
          suretyIncome: mockAnalytics.suretyIncome,
          totalCases: heatmap?.prisons?.reduce((s: number, p: { total_count: number }) => s + p.total_count, 0) || 5000,
          totalEligible: heatmap?.prisons?.reduce((s: number, p: { eligible_count: number }) => s + p.eligible_count, 0) || 1240,
        });
      } else {
        setData({
          ...mockAnalytics,
          totalCases: 5000,
          totalEligible: 1240,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-3 w-20 mb-3" /><div className="skeleton h-7 w-16" /></div>)}</div>
        <div className="grid grid-cols-2 gap-6">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-5 h-72"><div className="skeleton h-full" /></div>)}</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Undertrial Cases', value: data.totalCases?.toLocaleString() || '5,000', color: 'text-jg-blue' },
    { label: 'S.479 Eligible', value: data.totalEligible?.toLocaleString() || '1,240', color: 'text-jg-green' },
    { label: 'Avg Detention (days)', value: '342', color: 'text-jg-amber' },
    { label: 'Surety Gap Cases', value: '387', color: 'text-jg-red' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="text-xs text-jg-text-secondary mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charge vs Detention */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">📊 Charge Sections × Avg Detention Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.chargeDetention} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94A3B8" fontSize={11} />
              <YAxis type="category" dataKey="charge" stroke="#94A3B8" fontSize={10} width={80} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} />
              <Bar dataKey="avg_days" radius={[0, 4, 4, 0]}>
                {(data.chargeDetention || []).map((_: unknown, idx: number) => (
                  <Cell key={idx} fill={['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'][idx % 8]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Court Performance */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '480ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">🏛️ Worst Courts by Bail-Decision Delay</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.courtPerformance} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94A3B8" fontSize={11} />
              <YAxis type="category" dataKey="court" stroke="#94A3B8" fontSize={9} width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} />
              <Bar dataKey="avg_bail_days" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '560ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">📋 Case Distribution by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`}>
                {(data.statusDistribution || []).map((entry: { color: string }, idx: number) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* System Accuracy */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '640ms' }}>
          <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">📈 System Accuracy Over Time (Feedback Loop)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.systemAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} domain={[55, 95]} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
              <Line type="monotone" dataKey="eligibility" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Eligibility" />
              <Line type="monotone" dataKey="adjournment" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Adjournment" />
              <Line type="monotone" dataKey="bail" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Bail Prediction" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Surety-Income Scatter */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '720ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">💰 Surety Amount vs Monthly Income by District</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" dataKey="income" name="Monthly Income" stroke="#94A3B8" fontSize={11} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <YAxis type="number" dataKey="surety" name="Surety Amount" stroke="#94A3B8" fontSize={11} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px', color: '#E2E8F0' }} formatter={(value: unknown) => `₹${Number(value).toLocaleString()}` as any} />
            <Scatter name="Districts" data={data.suretyIncome} fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
