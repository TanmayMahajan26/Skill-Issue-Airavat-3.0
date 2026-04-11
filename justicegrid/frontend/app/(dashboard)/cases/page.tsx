'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { Search, Filter, Clock } from 'lucide-react';
import { CountdownClock } from '@/components/countdown-clock';

export default function AllCasesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (search) params.set('search', search);
      if (statusFilter) params.set('eligibility', statusFilter);
      if (stateFilter) params.set('state', stateFilter);
      
      if (user?.role === 'paralegal') {
        params.set('paralegal_id', user.id);
      } else if (user?.role === 'lawyer') {
        params.set('lawyer_id', user.id);
      }

      const data = await fetchAPI(`/api/v1/cases?${params.toString()}`);
      if (data?.cases) {
        setCases(data.cases);
      }
      setLoading(false);
    }
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, stateFilter, user]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-secondary" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setLoading(true); }}
            placeholder="Search by case number or name..."
            className="w-full pl-10 pr-4 py-2.5 bg-jg-surface border border-jg-border rounded-lg text-sm focus:outline-none focus:border-jg-blue/50 placeholder:text-jg-text-secondary text-jg-text"
          />
        </div>
        <select
          value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setLoading(true); }}
          className="bg-jg-surface border border-jg-border rounded-lg px-3 py-2.5 text-sm text-jg-text focus:outline-none focus:border-jg-blue/50"
        >
          <option value="">All Status</option>
          <option value="ELIGIBLE">Eligible</option>
          <option value="NOT_ELIGIBLE">Not Eligible</option>
          <option value="EXCLUDED">Excluded</option>
          <option value="REVIEW_NEEDED">Review Needed</option>
        </select>
        <select
          value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setLoading(true); }}
          className="bg-jg-surface border border-jg-border rounded-lg px-3 py-2.5 text-sm text-jg-text focus:outline-none focus:border-jg-blue/50"
        >
          <option value="">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Bihar">Bihar</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="West Bengal">West Bengal</option>
        </select>
        <div className="flex items-center gap-1.5 text-xs text-jg-text-secondary">
          <Filter className="w-3.5 h-3.5" /> {cases.length} cases
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="flex gap-4"><div className="skeleton h-4 w-32" /><div className="skeleton h-4 w-48" /><div className="skeleton h-4 w-24" /></div>)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jg-border bg-jg-surface-hover/30">
                  <th className="p-3 text-left text-xs text-jg-text-secondary font-medium">Case Number</th>
                  <th className="p-3 text-left text-xs text-jg-text-secondary font-medium">Accused</th>
                  <th className="p-3 text-left text-xs text-jg-text-secondary font-medium">Status</th>
                  <th className="p-3 text-right text-xs text-jg-text-secondary font-medium">Priority</th>
                  <th className="p-3 text-left text-xs text-jg-text-secondary font-medium">Charges</th>
                  <th className="p-3 text-left text-xs text-jg-text-secondary font-medium">Arrested</th>
                  <th className="p-3 text-center text-xs text-jg-text-secondary font-medium">Countdown</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id || c.case_id} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors cursor-pointer group">
                    <td className="p-3">
                      <Link href={`/cases/${c.id || c.case_id}`} className="text-jg-blue hover:underline font-medium">
                        {c.case_number}
                      </Link>
                    </td>
                    <td className="p-3 text-jg-text">{c.accused_name}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        c.eligibility_status === 'ELIGIBLE' ? 'badge-eligible' :
                        c.eligibility_status === 'EXCLUDED' ? 'badge-critical' :
                        c.eligibility_status === 'NOT_ELIGIBLE' ? 'badge-medium' : 'badge-high'
                      }`}>
                        {c.eligibility_status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${(c.priority_score || 0) >= 70 ? 'text-jg-red' : (c.priority_score || 0) >= 50 ? 'text-jg-amber' : 'text-jg-text-secondary'}`}>
                        {(c.priority_score || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {(c.charges || []).slice(0, 2).map((ch: { section: string }, i: number) => (
                          <span key={i} className="text-[10px] bg-jg-purple/15 text-jg-purple px-1.5 py-0.5 rounded border border-jg-purple/30">
                            S.{ch.section}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-jg-text-secondary text-xs">{c.arrest_date}</td>
                    <td className="p-3">
                      {c.countdown ? (
                        <CountdownClock days={c.countdown?.days} type={c.countdown?.type} />
                      ) : (
                        <span className="text-[11px] text-jg-text-secondary flex items-center gap-1 justify-center"><Clock className="w-3 h-3" /> N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
