import Image from 'next/image';
import Link from 'next/link';
import { Shield, Scale, Map, Radio, Zap, AlertTriangle, Lock, Users, LineChart, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full bg-jg-bg overflow-hidden flex flex-col">
      {/* ═══ HERO SECTION ═══ */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-6 lg:px-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-jg-blue rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-jg-purple rounded-full blur-[180px] opacity-10 animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          <div className="flex flex-col items-start gap-6 animate-slide-down">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-jg-blue/10 border border-jg-blue/20 text-jg-blue-light text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-jg-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-jg-blue"></span>
              </span>
              Section 479 BNSS Compliant
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 leading-[1.1] tracking-tight drop-shadow-xl">
              AI Legal Intelligence for India&apos;s Undertrial Crisis.
            </h1>
            <p className="text-lg lg:text-xl text-jg-text-secondary leading-relaxed max-w-xl font-light">
              Balancing Rights, Justice, and Social Stability. Automate bail eligibility scanning, predict adjournments, and draft petitions in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-indigo text-white font-bold text-[15px] shadow-[0_0_40px_-10px_rgba(88,101,242,0.5)] hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(88,101,242,0.7)] transition-all">
                Enter Platform <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-xl bg-jg-surface border border-jg-border text-jg-text font-semibold text-[15px] hover:bg-jg-surface-hover hover:border-jg-text-tertiary transition-all">
                Explore Features
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-jg-border w-full max-w-md">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-jg-text">2.4<span className="text-jg-blue">x</span></span>
                <span className="text-[10px] text-jg-text-secondary uppercase tracking-widest mt-1">Faster Processing</span>
              </div>
              <div className="w-px h-10 bg-jg-border" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-jg-text">50<span className="text-jg-green">k</span>+</span>
                <span className="text-[10px] text-jg-text-secondary uppercase tracking-widest mt-1">Cases Analyzed</span>
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-[400px] lg:h-[600px] rounded-3xl overflow-hidden border border-jg-border/50 shadow-2xl glass-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Image
              src="/hero-gavel.png"
              alt="The Role of Law in Modern Society - Gavel"
              fill
              className="object-cover object-center mix-blend-lighten"
              priority
            />
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-jg-bg via-transparent to-transparent opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-jg-bg/50" />
            
            {/* Floating UI Elements */}
            <div className="absolute bottom-8 left-8 right-8 glass-card p-4 backdrop-blur-xl border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-jg-green font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-jg-green rounded-full animate-pulse" /> Live Analysis
                </p>
                <p className="text-sm font-medium text-white shadow-sm">Reviewing MH-2024-CR-10042</p>
                <p className="text-[11px] text-white/50 mt-0.5">Section 479 eligibility confirmed.</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-jg-green/20 border border-jg-green/30 flex items-center justify-center">
                <Scale className="w-5 h-5 text-jg-green" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM LOGOS / TRUST ═══ */}
      <section className="border-y border-jg-border/50 bg-jg-bg-alt py-10 px-6 overflow-hidden relative">
        <p className="text-center text-xs font-semibold text-jg-text-tertiary uppercase tracking-[0.2em] mb-6">Built for systemic oversight</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale filter">
          {['Supreme Court', 'NALSA', 'DLSA', 'UTRC', 'eCourts'].map((label) => (
            <div key={label} className="text-lg font-bold tracking-tight text-white/60 flex items-center gap-2">
              <Shield className="w-5 h-5" /> {label}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FEATURES GRID ═══ */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-sm font-bold text-jg-blue tracking-widest uppercase mb-3">Intelligence Pillars</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-jg-text via-jg-text to-jg-text-secondary">
            A complete ecosystem for legal aid.
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass-card-hover p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 group-hover:-rotate-12 duration-500">
              <AlertTriangle className="w-32 h-32 text-jg-red" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-jg-red/10 border border-jg-red/20 flex items-center justify-center mb-6 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-5 h-5 text-jg-red" />
            </div>
            <h4 className="text-lg font-bold text-jg-text mb-2">Priority Queueing</h4>
            <p className="text-sm text-jg-text-secondary leading-relaxed">
              Algorithmic scoring ranks undertrials by urgency. Cases triggering Section 479 thresholds or life-imprisonment exclusions are instantly flagged for lawyer review.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card-hover p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Zap className="w-32 h-32 text-jg-blue" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-jg-blue/10 border border-jg-blue/20 flex items-center justify-center mb-6 shadow-[0_0_15px_-3px_rgba(88,101,242,0.2)]">
              <Zap className="w-5 h-5 text-jg-blue" />
            </div>
            <h4 className="text-lg font-bold text-jg-text mb-2">Petition Drafter</h4>
            <p className="text-sm text-jg-text-secondary leading-relaxed">
              Generate perfectly formatted S.479 or PR Bond petitions in seconds using Gemini 2.0 NLP, mapping abstract FIR narratives to hard IPC/BNSS logic.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card-hover p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
              <Map className="w-32 h-32 text-jg-green" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-jg-green/10 border border-jg-green/20 flex items-center justify-center mb-6 shadow-[0_0_15px_-3px_rgba(34,197,94,0.2)]">
              <Map className="w-5 h-5 text-jg-green" />
            </div>
            <h4 className="text-lg font-bold text-jg-text mb-2">Systemic Heatmaps</h4>
            <p className="text-sm text-jg-text-secondary leading-relaxed">
              Geospatial analytics overlaying prison overcrowding against court adjournment rates, allowing UTRC panels to target systemic bottlenecks directly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card-hover p-8 group relative overflow-hidden lg:col-span-2 flex flex-col justify-between">
            <div className="absolute bottom-0 right-10 opacity-5 group-hover:opacity-10 transition-all transform group-hover:translate-x-4 duration-500">
              <Radio className="w-48 h-48 text-jg-purple" />
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-jg-purple/10 border border-jg-purple/20 flex items-center justify-center mb-6 shadow-[0_0_15px_-3px_rgba(168,85,247,0.2)]">
                <Radio className="w-5 h-5 text-jg-purple" />
              </div>
              <h4 className="text-xl font-bold text-jg-text mb-3">Voice-First Family Access</h4>
              <p className="text-[15px] text-jg-text-secondary leading-relaxed max-w-xl">
                Legal jargon is meaningless to families. JusticeGrid scrubs out complex terminology and pushes automated, dialect-specific voice updates (IVR) letting families know exactly what hearing is next.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="glass-card-hover p-8 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:-translate-y-2 duration-500">
              <Lock className="w-32 h-32 text-jg-amber" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-jg-amber/10 border border-jg-amber/20 flex items-center justify-center mb-6 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]">
              <Lock className="w-5 h-5 text-jg-amber" />
            </div>
            <h4 className="text-lg font-bold text-jg-text mb-2">Federated Privacy</h4>
            <p className="text-sm text-jg-text-secondary leading-relaxed">
              Decentralized AI learning ensures that highly sensitive case histories never leave the DLSA local network. Only model weights are averaged globally.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ IMPACT / STATS ═══ */}
      <section id="impact" className="py-24 px-6 relative border-t border-jg-border/50">
        <div className="absolute inset-0 bg-gradient-to-b from-jg-bg-alt to-jg-bg pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Scale className="w-16 h-16 text-jg-blue/40 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Ready to untangle the backlog?
          </h2>
          <p className="text-lg text-jg-text-secondary mb-10 max-w-2xl mx-auto font-light">
            Empower paralegals, inform families, and provide UTRC panels with the systemic data they need to enact real change.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="px-10 py-5 rounded-2xl gradient-indigo text-white font-bold text-lg shadow-[0_0_50px_-10px_rgba(88,101,242,0.6)] hover:scale-105 hover:shadow-[0_0_80px_-15px_rgba(88,101,242,0.8)] transition-all flex items-center gap-3">
              Access JusticeGrid <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
