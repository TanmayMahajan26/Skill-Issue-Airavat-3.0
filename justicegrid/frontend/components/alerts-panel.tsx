'use client';
import { useEffect, useState } from 'react';
import { fetchAPI } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { AlertTriangle, Shield, FileText, X, Bell } from 'lucide-react';

const ALERT_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  DEFAULT_BAIL: { icon: AlertTriangle, color: 'text-jg-red', bg: 'bg-jg-red/10 border-jg-red/30' },
  CUSTODY_OVERLAP: { icon: Shield, color: 'text-jg-amber', bg: 'bg-jg-amber/10 border-jg-amber/30' },
  PR_BOND_TRIGGER: { icon: FileText, color: 'text-jg-purple', bg: 'bg-jg-purple/10 border-jg-purple/30' },
};

export function AlertsPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alerts, setAlerts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [breakdown, setBreakdown] = useState<any>({});
  const [open, setOpen] = useState(false);
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
    }
    if (user) load();
  }, [user]);

  const total = alerts.length;
  if (total === 0) return null;

  return (
    <>
      {/* Floating Alert Button */}
      <button
        onClick={() => setOpen(true)}
        className="glass-card p-4 border border-jg-red/30 hover:border-jg-red/60 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-jg-red animate-pulse" />
            <span className="text-sm font-semibold text-jg-text">Action Required</span>
          </div>
          <span className="text-xs bg-jg-red text-white px-2 py-0.5 rounded-full font-bold">{total}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {breakdown.default_bail > 0 && (
            <span className="text-jg-red">🚨 {breakdown.default_bail} Default Bail</span>
          )}
          {breakdown.custody_overlap > 0 && (
            <span className="text-jg-amber">🔒 {breakdown.custody_overlap} Ghost Warrant</span>
          )}
          {breakdown.pr_bond > 0 && (
            <span className="text-jg-purple">📋 {breakdown.pr_bond} PR Bond</span>
          )}
        </div>
      </button>

      {/* Alert Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md bg-jg-surface border-l border-jg-border overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-jg-surface/95 backdrop-blur-lg border-b border-jg-border p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-sm font-bold text-jg-text">Legal Intelligence Alerts</h3>
                <p className="text-[11px] text-jg-text-secondary">{total} active interventions required</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-jg-surface-hover">
                <X className="w-4 h-4 text-jg-text-secondary" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {alerts.map((alert, i) => {
                const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.DEFAULT_BAIL;
                const Icon = config.icon;
                return (
                  <Link
                    href={`/cases/${alert.case_id}`}
                    key={i}
                    className={`block p-4 rounded-xl border ${config.bg} hover:scale-[1.01] transition-all`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${config.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-jg-text">{alert.case_number}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            alert.severity === 'CRITICAL' ? 'bg-jg-red/20 text-jg-red'
                            : alert.severity === 'HIGH' ? 'bg-jg-amber/20 text-jg-amber'
                            : 'bg-jg-blue/20 text-jg-blue'
                          }`}>{alert.severity}</span>
                        </div>
                        <p className="text-[11px] text-jg-text-secondary leading-relaxed">{alert.message}</p>
                        <p className="text-[10px] text-jg-blue font-medium mt-1.5">→ {alert.action}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
