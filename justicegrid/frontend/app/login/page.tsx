'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Scale, Shield, Users, Radio, Settings, LogIn, ArrowRight } from 'lucide-react';

const ROLE_INFO: Record<string, { icon: typeof Scale; label: string; desc: string; gradient: string }> = {
  paralegal: {
    icon: Users, label: 'DLSA Paralegal',
    desc: 'Manage assigned cases, track eligibility, file bail applications',
    gradient: 'from-indigo-500 to-purple-600',
  },
  lawyer: {
    icon: Scale, label: 'NALSA Panel Lawyer',
    desc: 'Review flagged cases, provide legal opinions, track outcomes',
    gradient: 'from-emerald-500 to-cyan-500',
  },
  supervisor: {
    icon: Shield, label: 'DLSA Supervisor',
    desc: 'Oversee paralegal workload, review analytics, audit decisions',
    gradient: 'from-amber-500 to-rose-500',
  },
  utrc: {
    icon: Radio, label: 'UTRC Coordinator',
    desc: 'Monitor undertrial review, manage committee sessions',
    gradient: 'from-purple-500 to-pink-500',
  },
  admin: {
    icon: Settings, label: 'System Admin',
    desc: 'System health, federated learning, audit logs',
    gradient: 'from-slate-400 to-indigo-500',
  },
};

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) router.replace('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/users`);
        if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
      } catch { setError('Cannot connect to backend. Start the API server on port 8000.'); }
    }
    fetchUsers();
  }, []);

  const handleLogin = async () => {
    if (!selectedEmail) return;
    setLogging(true); setError('');
    const ok = await login(selectedEmail);
    if (ok) router.replace('/'); else setError('Login failed.');
    setLogging(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-jg-bg flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-jg-blue/30 border-t-jg-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-jg-bg flex">
      {/* ═══ LEFT: BRANDING ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-jg-blue/15 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-jg-purple/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-indigo flex items-center justify-center text-white text-xl font-bold shadow-xl">
              ⚖
            </div>
            <div>
              <h1 className="text-2xl font-bold text-jg-text">JusticeGrid</h1>
              <p className="text-[11px] text-jg-text-tertiary tracking-wider uppercase">Legal Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-jg-text leading-tight mb-4">
            Make a single paralegal with 200 cases as effective as{' '}
            <span className="gradient-text">a team of 10.</span>
          </h2>

          <p className="text-sm text-jg-text-secondary leading-relaxed mb-8">
            AI monitors every active case for eligibility events, surfaces the right case to the right person
            at the right moment, and explains eligibility in plain language.
          </p>

          <div className="space-y-3">
            {['S.187 Default Bail Countdown', 'One-Click Petition Drafting', 'Ghost Warrant Resolution', 'Bail Condition Checklist (Hindi + English)'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-jg-text-secondary">
                <div className="w-1.5 h-1.5 rounded-full bg-jg-blue" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: LOGIN FORM ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center text-white font-bold text-lg shadow-lg">⚖</div>
              <h1 className="text-xl font-bold text-jg-text">JusticeGrid</h1>
            </div>
            <p className="text-xs text-jg-text-tertiary">AI-Augmented Legal Intelligence</p>
          </div>

          <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-[15px] font-semibold text-jg-text mb-1">Sign in</h2>
            <p className="text-xs text-jg-text-secondary mb-5">Select your role to access the platform.</p>

            {error && (
              <div className="bg-jg-red/8 border border-jg-red/20 text-jg-red text-xs px-4 py-2.5 rounded-xl mb-4">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-2">
              {users.map((u) => {
                const info = ROLE_INFO[u.role] || ROLE_INFO.admin;
                const Icon = info.icon;
                const isSelected = selectedEmail === u.email;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedEmail(u.email)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left
                      ${isSelected
                        ? 'border-jg-blue/40 bg-jg-blue/8 shadow-lg shadow-jg-blue/5'
                        : 'border-jg-border hover:border-jg-border-light hover:bg-jg-surface-hover/50'
                      }`}
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white shadow-md shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-jg-text">{u.name}</p>
                      <p className="text-[11px] text-jg-text-secondary">{info.label}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0
                      ${isSelected ? 'border-jg-blue bg-jg-blue' : 'border-jg-border'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleLogin}
              disabled={!selectedEmail || logging}
              className={`w-full mt-5 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
                ${selectedEmail ? 'btn-primary' : 'bg-jg-surface-hover text-jg-text-tertiary cursor-not-allowed'}`}
            >
              {logging ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Enter Dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="text-[10px] text-jg-text-tertiary text-center mt-4">
              Demo mode — select any role to explore. Production uses JWT auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
