'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Scale, Shield, Users, Radio, Settings, ArrowRight, Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';

/* ── Default credentials per persona ── */
const DEMO_CREDENTIALS = [
  { email: 'paralegal@justicegrid.in', password: 'justice@2025', name: 'Priya Sharma', role: 'paralegal', label: 'DLSA Paralegal', icon: Users, gradient: 'from-indigo-500 to-purple-600', desc: 'Case queue, petitions, hearings' },
  { email: 'lawyer@justicegrid.in', password: 'justice@2025', name: 'Adv. Rajan Mehta', role: 'lawyer', label: 'NALSA Panel Lawyer', icon: Scale, gradient: 'from-emerald-500 to-cyan-500', desc: 'Flagged cases, legal opinion' },
  { email: 'supervisor@justicegrid.in', password: 'justice@2025', name: 'Dr. Anjali Desai', role: 'supervisor', label: 'DLSA Supervisor', icon: Shield, gradient: 'from-amber-500 to-rose-500', desc: 'Oversight, audit, accuracy' },
  { email: 'utrc@justicegrid.in', password: 'justice@2025', name: 'Rajesh Kumar', role: 'utrc', label: 'UTRC Coordinator', icon: Radio, gradient: 'from-purple-500 to-pink-500', desc: 'Prison review, district data' },
  { email: 'admin@justicegrid.in', password: 'justice@2025', name: 'System Admin', role: 'admin', label: 'System Admin', icon: Settings, gradient: 'from-slate-400 to-indigo-500', desc: 'Full platform access' },
  { email: 'family@justicegrid.in', password: 'justice@2025', name: 'Rahul (Family)', role: 'family', label: 'Family Member', icon: Heart, gradient: 'from-teal-400 to-emerald-500', desc: 'Case status, bail info' },
];

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const handleQuickFill = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setSelectedRole(cred.role);
    setError('');
  };

  const handleLogin = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    if (!password) { setError('Please enter your password.'); return; }
    setLogging(true); setError('');
    const ok = await login(email);
    if (ok) router.replace('/dashboard'); else setError('Invalid credentials. Please try again.');
    setLogging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
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
            <p className="text-xs text-jg-text-secondary mb-5">Enter your credentials to access the platform.</p>

            {error && (
              <div className="bg-jg-red/8 border border-jg-red/20 text-jg-red text-xs px-4 py-2.5 rounded-xl mb-4">
                ⚠️ {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-3 mb-4">
              <div>
                <label htmlFor="login-email" className="block text-[11px] font-medium text-jg-text-secondary uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-tertiary" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="user@justicegrid.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-jg-bg border border-jg-border rounded-xl text-[13px]
                               text-jg-text placeholder:text-jg-text-tertiary focus:border-jg-blue/50 focus:ring-1 focus:ring-jg-blue/20 transition-all outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="login-password" className="block text-[11px] font-medium text-jg-text-secondary uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-tertiary" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-jg-bg border border-jg-border rounded-xl text-[13px]
                               text-jg-text placeholder:text-jg-text-tertiary focus:border-jg-blue/50 focus:ring-1 focus:ring-jg-blue/20 transition-all outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-jg-text-tertiary hover:text-jg-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={!email || !password || logging}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
                ${email && password ? 'btn-primary' : 'bg-jg-surface-hover text-jg-text-tertiary cursor-not-allowed'}`}
            >
              {logging ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* ═══ DEMO QUICK-FILL CARDS ═══ */}
          <div className="mt-5 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <p className="text-[10px] text-jg-text-tertiary uppercase tracking-widest font-semibold mb-3 text-center">
              Demo Credentials — click to auto-fill
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDENTIALS.map((cred) => {
                const Icon = cred.icon;
                const isActive = selectedRole === cred.role && email === cred.email;
                return (
                  <button
                    key={cred.role}
                    onClick={() => handleQuickFill(cred)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center
                      ${isActive
                        ? 'border-jg-blue/40 bg-jg-blue/8 shadow-lg shadow-jg-blue/10'
                        : 'border-jg-border hover:border-jg-border-light hover:bg-jg-surface-hover/50 glass-subtle'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cred.gradient} flex items-center justify-center text-white shadow-md`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] font-semibold text-jg-text leading-tight">{cred.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-jg-text-tertiary leading-tight">{cred.label}</p>
                  </button>
                );
              })}
            </div>
            <p className="text-[9px] text-jg-text-tertiary text-center mt-3">
              Default password: <code className="bg-jg-surface px-1.5 py-0.5 rounded text-jg-text-secondary font-mono">justice@2025</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
