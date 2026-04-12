'use client';
import { useAuth } from '@/lib/auth-context';
import { Scale, BookOpen, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UnderstandBailPage() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8 animate-slide-down">
        <div className="w-16 h-16 rounded-full bg-jg-blue/10 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-jg-blue" />
        </div>
        <h1 className="text-2xl font-bold text-jg-text mb-2">जमानत क्या है?</h1>
        <p className="text-sm text-jg-text-secondary">Understanding Bail & Your Rights</p>
      </div>

      <div className="glass-card p-6 animate-slide-up">
        <h2 className="text-lg font-bold text-jg-text mb-3 flex items-center gap-2">
          <Scale className="w-5 h-5 text-jg-blue" />
          What is Bail? (जमानत क्या है?)
        </h2>
        <p className="text-sm text-jg-text-secondary leading-relaxed mb-4">
          जमानत का मतलब रिहाई नहीं है। इसका मतलब है कि जब तक अदालत में मामला चल रहा है, 
          तब तक आरोपी जेल से बाहर रहकर अपने मामले की पैरवी कर सकता है।
          <br /><br />
          Bail does not mean the case is over. It means the accused can stay out of jail 
          and attend court hearings from home while the trial is ongoing.
        </p>
      </div>

      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-lg font-bold text-jg-green mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          BNSS Section 479 (Half-Time Served)
        </h2>
        <div className="bg-jg-bg p-4 rounded-xl border border-jg-border mb-4">
          <p className="text-sm text-jg-text-secondary leading-relaxed">
            अगर किसी विचाराधीन कैदी (undertrial) ने उस अपराध के लिए अधिकतम सजा का <span className="text-jg-green font-bold">आधा समय (1/2)</span> जेल में बिता लिया है, 
            तो नया कानून (BNSS Section 479) कहता है कि उसे जमानत पर छोड़ दिया जाना चाहिए।
            <br /><br />
            If an undertrial has spent <span className="text-jg-green font-bold">half (1/2)</span> of the maximum possible sentence for their crime in jail, 
            the new law mandates they must be released on bail.
          </p>
        </div>
        <div className="flex items-start gap-3 p-3 bg-jg-blue/10 border border-jg-blue/20 rounded-lg">
          <Clock className="w-5 h-5 text-jg-blue shrink-0 mt-0.5" />
          <p className="text-xs text-jg-text-secondary">
            Your relative has served 2.4 years of a maximum 4-year sentence. They are <strong>eligible</strong> under this rule.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 border-jg-amber/20 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-bold text-jg-amber mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Important Rules (महत्वपूर्ण नियम)
        </h2>
        <ul className="space-y-3 text-sm text-jg-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-jg-amber">•</span> 
            <span>आरोपी को हर तारीख पर अदालत आना होगा। (Must attend all court dates)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-jg-amber">•</span> 
            <span>गवाहों को डराना या सबूतों से छेड़छाड़ करना सख्त मना है। (Do not threaten witnesses)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-jg-amber">•</span> 
            <span>अदालत की अनुमति के बिना शहर या देश नहीं छोड़ सकते। (Cannot leave city without permission)</span>
          </li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <Link href="/" className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold transition-all">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
