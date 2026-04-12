import Link from 'next/link';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-jg-bg text-jg-text font-sans">
      <header className="fixed top-0 inset-x-0 z-50 bg-jg-bg/60 backdrop-blur-2xl border-b border-jg-border h-[72px] flex items-center justify-between px-8 lg:px-12 transition-all">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-jg-blue/20 group-hover:scale-105 transition-transform">
            ⚖
          </div>
          <span className="font-bold text-jg-text text-[17px] tracking-wide">JusticeGrid</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#platform" className="text-sm font-medium text-jg-text-secondary hover:text-jg-text transition-colors">Platform</Link>
          <Link href="#features" className="text-sm font-medium text-jg-text-secondary hover:text-jg-text transition-colors">Features</Link>
          <Link href="#impact" className="text-sm font-medium text-jg-text-secondary hover:text-jg-text transition-colors">Impact</Link>
          <div className="w-px h-5 bg-jg-border mx-2" />
          <Link href="/login" className="text-[13px] font-bold text-white gradient-indigo px-5 py-2.5 rounded-xl shadow-lg border border-jg-blue/30 hover:shadow-jg-blue/40 hover:scale-105 transition-all">
            Enter Dashboard
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 w-full flex flex-col pt-[72px]">
        {children}
      </main>

      <footer className="border-t border-jg-border py-16 px-8 flex flex-col items-center justify-center bg-jg-bg-alt relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-jg-blue/20 to-transparent" />
        <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center text-white font-bold text-lg mb-6 opacity-30 grayscale saturate-0 mix-blend-luminosity">
          ⚖
        </div>
        <div className="flex gap-6 mb-6">
          <Link href="#" className="text-xs text-jg-text-tertiary hover:text-jg-text transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs text-jg-text-tertiary hover:text-jg-text transition-colors">Terms of Service</Link>
          <Link href="#" className="text-xs text-jg-text-tertiary hover:text-jg-text transition-colors">Contact NALSA</Link>
        </div>
        <p className="text-[11px] text-jg-text-secondary text-center max-w-sm leading-relaxed">
          Built for India. AI Legal Intelligence tracking Section 479 BNSS eligibility. 
          <br/><span className="text-jg-text-tertiary mt-2 block">© 2026 JusticeGrid Framework. All rights reserved.</span>
        </p>
      </footer>
    </div>
  );
}
