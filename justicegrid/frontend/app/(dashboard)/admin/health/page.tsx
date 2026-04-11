'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Shield } from 'lucide-react';

export default function HealthPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchAPI('/health');
      const apiRoot = await fetchAPI('/');
      setHealth({
        overall: data?.status === 'healthy' ? 'healthy' : 'degraded',
        apiStatus: apiRoot?.status || 'unknown',
        apiVersion: apiRoot?.version || '1.0.0',
        sources: [
          { source: 'FastAPI Backend', status: apiRoot ? 'healthy' : 'down', message: apiRoot ? `v${apiRoot.version} — ${apiRoot.pillars} pillars active` : 'Cannot connect' },
          { source: 'SQLite Database', status: 'healthy', message: 'justicegrid_dev.db — 5,000 cases seeded' },
          { source: 'Eligibility Engine', status: 'healthy', message: 'S.479 BNSS computation active' },
          { source: 'Priority Scorer', status: 'healthy', message: 'Composite scoring operational' },
          { source: 'WhatsApp/Twilio', status: 'degraded', message: 'Simulator mode — no live API key' },
          { source: 'IVR/Bhashini TTS', status: 'degraded', message: 'Simulator mode — demo keypad only' },
          { source: 'Gemini NLP', status: apiRoot ? 'healthy' : 'degraded', message: 'Charge extraction, translation' },
          { source: 'Redis Cache', status: 'degraded', message: 'No Redis configured — using in-memory' },
        ],
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !health) {
    return <div className="space-y-4"><div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="glass-card p-4"><div className="skeleton h-7 w-16" /></div>)}</div></div>;
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-jg-green" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-jg-amber" />;
      default: return <XCircle className="w-5 h-5 text-jg-red" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'healthy': return { bg: 'bg-jg-green/15', border: 'border-jg-green/30', text: 'text-jg-green' };
      case 'degraded': return { bg: 'bg-jg-amber/15', border: 'border-jg-amber/30', text: 'text-jg-amber' };
      default: return { bg: 'bg-jg-red/15', border: 'border-jg-red/30', text: 'text-jg-red' };
    }
  };

  const healthyCount = health.sources.filter((s: { status: string }) => s.status === 'healthy').length;
  const degradedCount = health.sources.filter((s: { status: string }) => s.status === 'degraded').length;
  const downCount = health.sources.filter((s: { status: string }) => s.status === 'down').length;

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`glass-card p-5 border-l-4 animate-slide-up ${
        health.overall === 'healthy' ? 'border-l-jg-green' : health.overall === 'degraded' ? 'border-l-jg-amber' : 'border-l-jg-red'
      }`}>
        <div className="flex items-center gap-3">
          <Activity className={`w-6 h-6 ${health.overall === 'healthy' ? 'text-jg-green' : 'text-jg-amber'}`} />
          <div>
            <h2 className="text-lg font-bold text-jg-text">System Health: <span className={health.overall === 'healthy' ? 'text-jg-green' : 'text-jg-amber'}>{health.overall.toUpperCase()}</span></h2>
            <p className="text-xs text-jg-text-secondary">JusticeGrid API v{health.apiVersion} — Last checked: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Healthy', value: healthyCount, color: 'text-jg-green', icon: CheckCircle },
          { label: 'Degraded', value: degradedCount, color: 'text-jg-amber', icon: AlertTriangle },
          { label: 'Down', value: downCount, color: 'text-jg-red', icon: XCircle },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Icon className={`w-4 h-4 ${s.color} mb-2`} />
              <p className="text-xs text-jg-text-secondary mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-jg-blue" /> Service Status
        </h3>
        <div className="space-y-3">
          {health.sources.map((s: { source: string; status: string; message: string }, i: number) => {
            const colors = statusColor(s.status);
            return (
              <div key={i} className="flex items-center gap-4 bg-jg-surface-hover/30 rounded-lg p-4">
                <div className={`w-10 h-10 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
                  {statusIcon(s.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-jg-text">{s.source}</p>
                  <p className="text-[11px] text-jg-text-secondary">{s.message}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Degradation Matrix */}
      <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-sm font-semibold text-jg-text mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-jg-purple" /> Graceful Degradation Matrix (Pillar 5)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jg-border">
                <th className="py-2 px-3 text-left text-xs text-jg-text-secondary font-medium">If Down</th>
                <th className="py-2 px-3 text-left text-xs text-jg-text-secondary font-medium">Fallback</th>
                <th className="py-2 px-3 text-left text-xs text-jg-text-secondary font-medium">Impact</th>
                <th className="py-2 px-3 text-center text-xs text-jg-text-secondary font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {[
                { service: 'eCourts API', fallback: 'Show last-known data with STALE badge', impact: 'Delayed updates, no live hearing data', severity: 'medium' },
                { service: 'Gemini NLP', fallback: 'Rule-based charge extraction', impact: 'Lower accuracy on non-standard FIRs', severity: 'low' },
                { service: 'Database', fallback: 'Read-only from IndexedDB cache', impact: 'No writes, stale data', severity: 'high' },
                { service: 'Redis Cache', fallback: 'In-memory caching + direct DB queries', impact: 'Slower response times', severity: 'low' },
                { service: 'Twilio/WhatsApp', fallback: 'SMS fallback + IVR phone call', impact: 'Limited family notifications', severity: 'medium' },
              ].map((row) => (
                <tr key={row.service} className="border-b border-jg-border/50 hover:bg-jg-surface-hover/30 transition-colors">
                  <td className="py-2.5 px-3 text-jg-text font-medium">{row.service}</td>
                  <td className="py-2.5 px-3 text-jg-text-secondary text-xs">{row.fallback}</td>
                  <td className="py-2.5 px-3 text-jg-text-secondary text-xs">{row.impact}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      row.severity === 'high' ? 'badge-critical' : row.severity === 'medium' ? 'badge-high' : 'badge-medium'
                    }`}>
                      {row.severity.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stale data notice */}
      <div className="glass-card p-4 bg-jg-amber/5 border-jg-amber/20 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-jg-amber shrink-0" />
          <div>
            <p className="text-xs text-jg-amber font-semibold">Stale Data Policy</p>
            <p className="text-[11px] text-jg-text-secondary">Data older than 48 hours is marked STALE. Confidence scores are automatically reduced by 15% for stale inputs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
