'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { Shield, Search, Download } from 'lucide-react';

export default function AuditPage() {
  const [search, setSearch] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAPI('/api/v1/admin/audit-log?limit=50');
      if (data?.entries) {
        setEntries(data.entries);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = entries.filter(
    (a) => (a.case_id || '').toLowerCase().includes(search.toLowerCase()) || (a.assessment_type || '').includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-4 w-1/3 mb-2" /><div className="skeleton h-3 w-2/3" /></div>)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="glass-card p-4 flex items-center gap-3 flex-1 mr-4">
          <Shield className="w-5 h-5 text-jg-purple" />
          <div>
            <h3 className="text-sm font-semibold text-jg-text">Immutable Audit Log</h3>
            <p className="text-[11px] text-jg-text-secondary">Every eligibility assessment is logged immutably. No UPDATE or DELETE allowed.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-sm bg-jg-surface-hover text-jg-text-secondary px-4 py-2 rounded-lg hover:bg-jg-border transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-secondary" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by case ID or assessment type..."
          className="w-full pl-10 pr-4 py-2.5 bg-jg-surface border border-jg-border rounded-lg text-sm focus:outline-none focus:border-jg-blue/50 placeholder:text-jg-text-secondary text-jg-text"
        />
      </div>

      {/* Audit entries */}
      <div className="space-y-3">
        {filtered.map((entry, i) => (
          <div key={entry.id || i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-jg-text">{entry.case_id}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    entry.assessment_type === 'eligibility' ? 'badge-eligible' :
                    entry.assessment_type === 'priority' ? 'badge-medium' :
                    entry.assessment_type === 'surety' ? 'badge-high' : 'badge-low'
                  }`}>
                    {entry.assessment_type}
                  </span>
                  {entry.paralegal_response && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      entry.paralegal_response === 'acted_on' ? 'bg-jg-green/15 text-jg-green' : 'bg-jg-amber/15 text-jg-amber'
                    }`}>
                      {entry.paralegal_response}
                    </span>
                  )}
                </div>
                <p className="text-xs text-jg-text-secondary leading-relaxed">{entry.reasoning || entry.reasoning_chain || ''}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-jg-text-secondary">
                  <span>Confidence: <span className="text-jg-blue font-medium">{((entry.confidence || 0) * 100).toFixed(0)}%</span></span>
                  {entry.paralegal_id && <span>By: {entry.paralegal_id}</span>}
                  <span>v{entry.system_version || '1.0.0'}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-jg-text-secondary">{new Date(entry.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
