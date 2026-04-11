'use client';
import { useEffect, useState } from 'react';
import { CountdownClock } from '@/components/countdown-clock';
import { fetchAPI } from '@/lib/api-client';
import { mockCaseQueue } from '@/lib/mock-data';
import Link from 'next/link';
import {
  ChevronRight,
  Search,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
} from 'lucide-react';

function getPriorityBadge(score: number) {
  if (score >= 90)
    return { label: 'CRITICAL', class: 'badge-critical' };
  if (score >= 70)
    return { label: 'HIGH', class: 'badge-high' };
  if (score >= 50)
    return { label: 'MEDIUM', class: 'badge-medium' };
  return { label: 'LOW', class: 'badge-low' };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ELIGIBLE':
      return 'badge-eligible';
    case 'EXCLUDED':
      return 'badge-critical';
    default:
      return 'badge-high';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PriorityQueuePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCases() {
      const data = await fetchAPI('/api/v1/cases/queue?limit=50');
      if (data?.cases) {
        setCases(data.cases);
      } else {
        setCases(mockCaseQueue.cases);
      }
      setLoading(false);
    }
    loadCases();
  }, []);

  const filteredCases = cases.filter(
    (c) =>
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.accused_name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: 'Total Active',
      value: cases.length,
      icon: Users,
      color: 'text-jg-blue',
      bg: 'bg-jg-blue/10',
      border: 'border-jg-blue/20',
    },
    {
      label: 'Eligible',
      value: cases.filter((c) => c.eligibility_status === 'ELIGIBLE').length,
      icon: CheckCircle,
      color: 'text-jg-green',
      bg: 'bg-jg-green/10',
      border: 'border-jg-green/20',
    },
    {
      label: 'Overdue',
      value: cases.filter((c) => c.countdown?.type === 'overdue').length,
      icon: Clock,
      color: 'text-jg-red',
      bg: 'bg-jg-red/10',
      border: 'border-jg-red/20',
    },
    {
      label: 'Hearing This Week',
      value: cases.filter((c) => c.flags?.includes('TIME_SENSITIVE')).length,
      icon: Calendar,
      color: 'text-jg-amber',
      bg: 'bg-jg-amber/10',
      border: 'border-jg-amber/20',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-7 w-12" />
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4">
            <div className="skeleton h-4 w-1/3 mb-3" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card p-4 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-jg-text-secondary text-xs font-medium">
                  {stat.label}
                </p>
                <div
                  className={`w-8 h-8 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-secondary" />
          <input
            id="case-search"
            type="text"
            placeholder="Search by case number or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-jg-surface border border-jg-border rounded-lg text-sm
                       focus:outline-none focus:border-jg-blue/50 focus:ring-1 focus:ring-jg-blue/20 
                       placeholder:text-jg-text-secondary transition-all text-jg-text"
          />
        </div>
      </div>

      {/* Case list */}
      <div className="space-y-3">
        {filteredCases.map((c, i) => {
          const badge = getPriorityBadge(c.priority_score);
          return (
            <Link
              key={c.case_id}
              href={`/cases/${c.case_id}`}
              className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer group block animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Priority badge */}
              <div
                className={`px-2.5 py-2 rounded-lg text-center shrink-0 min-w-[72px] ${badge.class}`}
              >
                <div className="text-[10px] font-bold tracking-wider">
                  {badge.label}
                </div>
                <div className="text-sm font-bold mt-0.5">
                  {c.priority_score?.toFixed(1)}
                </div>
              </div>

              {/* Case info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-jg-text">
                    {c.case_number}
                  </span>
                  <span className="text-xs text-jg-text-secondary">
                    • {c.accused_name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(c.eligibility_status)}`}
                  >
                    {c.eligibility_status}
                  </span>
                  {c.flags?.includes('LAWYER_REVIEW') && (
                    <span className="text-[10px] bg-jg-amber/20 text-jg-amber px-2 py-0.5 rounded-full flex items-center gap-1 border border-jg-amber/30">
                      <AlertTriangle className="w-3 h-3" /> Lawyer Review
                    </span>
                  )}
                  {c.flags?.includes('HIGH_ADJOURNMENT') && (
                    <span className="text-[10px] bg-jg-purple/20 text-jg-purple px-2 py-0.5 rounded-full border border-jg-purple/30">
                      High Adjournment
                    </span>
                  )}
                </div>
                <p className="text-xs text-jg-text-secondary truncate leading-relaxed">
                  {c.one_line_reason}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-jg-text-secondary flex-wrap">
                  <span>📍 {c.state}</span>
                  <span>🏛️ {c.court}</span>
                  <span>📅 {c.detention_days}d detained</span>
                  {c.confidence > 0 && (
                    <span className="text-jg-blue flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {(c.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                  {c.bail_success_probability != null && (
                    <span className="text-jg-green">
                      📊 {(c.bail_success_probability * 100).toFixed(0)}% bail
                      success
                    </span>
                  )}
                </div>
              </div>

              {/* Countdown */}
              <CountdownClock days={c.countdown?.days} type={c.countdown?.type} />

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-jg-text-secondary group-hover:text-jg-blue transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      {filteredCases.length === 0 && !loading && (
        <div className="glass-card p-12 text-center">
          <Search className="w-12 h-12 text-jg-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-jg-text-secondary text-sm">
            No cases found matching &ldquo;{search}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
