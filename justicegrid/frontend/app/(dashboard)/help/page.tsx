'use client';
import { Phone, MapPin, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8 animate-slide-down">
        <div className="w-16 h-16 rounded-full bg-jg-green/10 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-jg-green" />
        </div>
        <h1 className="text-2xl font-bold text-jg-text mb-2">मुफ्त कानूनी सहायता</h1>
        <p className="text-sm text-jg-text-secondary">Free Legal Help & Support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 flex flex-col items-center text-center animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-jg-blue/10 flex items-center justify-center mb-4">
            <Phone className="w-6 h-6 text-jg-blue" />
          </div>
          <h2 className="text-lg font-bold text-jg-text mb-2">National Helpline</h2>
          <p className="text-sm text-jg-text-secondary mb-4">Call the free NALSA helpline for immediate legal assistance.</p>
          <a href="tel:1516" className="w-full py-3 rounded-xl bg-jg-blue/10 text-jg-blue hover:bg-jg-blue/20 font-bold transition-all text-xl mt-auto border border-jg-blue/20">
            1516
          </a>
        </div>

        <div className="glass-card p-6 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="w-12 h-12 rounded-full bg-jg-green/10 flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-jg-green" />
          </div>
          <h2 className="text-lg font-bold text-jg-text mb-2">Find Local DLSA</h2>
          <p className="text-sm text-jg-text-secondary mb-4">Visit your District Legal Services Authority office for an assigned lawyer.</p>
          <Link href="https://nalsa.gov.in/lsams/" target="_blank" className="w-full py-3 rounded-xl bg-jg-green/10 text-jg-green hover:bg-jg-green/20 font-bold transition-all mt-auto flex items-center justify-center gap-2 border border-jg-green/20">
            Find Near Me <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-bold text-jg-text mb-4 text-center">Important Links (महत्वपूर्ण लिंक)</h2>
        <div className="space-y-3">
          <a href="https://eprisons.nic.in" target="_blank" className="flex items-center justify-between p-4 bg-jg-bg border border-jg-border rounded-xl hover:border-jg-blue/50 transition-all group">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-jg-text-secondary group-hover:text-jg-blue" />
              <div>
                <p className="text-sm font-semibold text-jg-text">e-Prisons Portal</p>
                <p className="text-xs text-jg-text-tertiary">Check inmate details</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-jg-text-tertiary group-hover:text-jg-blue" />
          </a>
          <a href="https://services.ecourts.gov.in" target="_blank" className="flex items-center justify-between p-4 bg-jg-bg border border-jg-border rounded-xl hover:border-jg-blue/50 transition-all group">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-jg-text-secondary group-hover:text-jg-blue" />
              <div>
                <p className="text-sm font-semibold text-jg-text">e-Courts Services</p>
                <p className="text-xs text-jg-text-tertiary">Check case status & orders</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-jg-text-tertiary group-hover:text-jg-blue" />
          </a>
        </div>
      </div>
    </div>
  );
}
