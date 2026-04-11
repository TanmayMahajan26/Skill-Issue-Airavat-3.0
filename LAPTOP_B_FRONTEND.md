# LAPTOP B — Frontend Lead: Complete Instructions

> **Your role**: You are the FACE of the product. Everything judges see and interact with is yours.
> **Your folder**: `frontend/` — ONLY you edit files here.
> **You start after Laptop A pushes** (minute ~10). You use MOCK data first, then switch to real APIs.

---

## Pre-requisites (Install BEFORE the hackathon)

```bash
# Node.js 18+ and npm
node --version   # Must be 18+
npm --version

# Git
git --version
```

---

## Step-by-Step Instructions

### STEP 1 (Minute 10): Clone the repo

Wait for Laptop A to message that the repo is ready.

```bash
git clone https://github.com/THEIR_USERNAME/justicegrid.git
cd justicegrid
```

Create your `.env` file with values A shares privately.

---

### STEP 2 (Minute 10-30): Initialize Next.js in frontend/

```bash
cd frontend

# Initialize Next.js (inside the existing frontend/ folder)
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --no-src-dir --no-import-alias

# Install dependencies
npm install recharts leaflet react-leaflet @types/leaflet
npm install framer-motion lucide-react clsx
npm install idb
npm install @supabase/supabase-js
```

---

### STEP 3 (Minute 30-60): Design System Setup

Replace `app/globals.css` with your dark theme:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #0F172A;
  --bg-surface: #1E293B;
  --bg-surface-hover: #334155;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --border: #334155;
  --blue: #3B82F6;
  --purple: #8B5CF6;
  --green: #10B981;
  --amber: #F59E0B;
  --red: #EF4444;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Noto Sans Devanagari', sans-serif;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

/* Animations */
@keyframes pulse-red {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
}

@keyframes countdown-tick {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse-danger { animation: pulse-red 2s infinite; }
.countdown-active { animation: countdown-tick 1s ease-in-out infinite; }

/* Glassmorphism cards */
.glass-card {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 12px;
}
```

Update `tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'jg-bg': '#0F172A',
        'jg-surface': '#1E293B',
        'jg-surface-hover': '#334155',
        'jg-border': '#334155',
        'jg-blue': '#3B82F6',
        'jg-purple': '#8B5CF6',
        'jg-green': '#10B981',
        'jg-amber': '#F59E0B',
        'jg-red': '#EF4444',
        'jg-text': '#F8FAFC',
        'jg-text-secondary': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      },
    },
  },
  plugins: [],
};
export default config;
```

---

### STEP 4 (Hour 1): Create API Client + Mock Data

Create `lib/api-client.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    // Fallback to mock data during development
    return null;
  }
}
```

Create `lib/mock-data.ts` — **USE THIS UNTIL LAPTOP A's APIs ARE READY**:
```typescript
export const mockCaseQueue = {
  cases: [
    {
      case_id: "uuid-1",
      case_number: "MH-2024-CR-10001",
      accused_name: "Rajesh Kumar",
      priority_score: 94.2,
      one_line_reason: "Eligible under S.479 — first offender, 40% of max served, hearing in 3 days",
      charges: [{ section: "379", act: "IPC", description: "Theft", max_years: 3, life_or_death: false }],
      next_action: "File bail application before 14-Apr hearing",
      confidence: 0.87,
      bail_success_probability: 0.73,
      eligibility_status: "ELIGIBLE",
      countdown: { days: -47, display: "OVERDUE by 47 days", type: "overdue" },
      flags: ["OVERDUE", "TIME_SENSITIVE"],
      state: "Maharashtra",
      court: "Sessions Court, Pune",
      prison: "Yerwada Central Prison",
      detention_days: 412,
      next_hearing_date: "2026-04-14",
      arrest_date: "2025-02-23",
    },
    {
      case_id: "uuid-2",
      case_number: "UP-2025-CR-10042",
      accused_name: "Mohammed Iqbal",
      priority_score: 88.7,
      one_line_reason: "Becomes eligible in 5 days — hearing next week, lawyer assigned",
      charges: [{ section: "420", act: "IPC", description: "Cheating", max_years: 7, life_or_death: false }],
      next_action: "Prepare bail application — eligibility window opening",
      confidence: 0.82,
      bail_success_probability: 0.61,
      eligibility_status: "PENDING",
      countdown: { days: 5, display: "Eligible in 5 days", type: "upcoming" },
      flags: ["TIME_SENSITIVE"],
      state: "Uttar Pradesh",
      court: "Magistrate Court, Lucknow",
      prison: "Lucknow District Prison",
      detention_days: 847,
      next_hearing_date: "2026-04-18",
      arrest_date: "2024-01-15",
    },
    {
      case_id: "uuid-3",
      case_number: "TN-2024-CR-10089",
      accused_name: "Suresh Rajan",
      priority_score: 72.1,
      one_line_reason: "Eligible but bail granted 45 days ago — surety ₹2,00,000 unexecuted (8× monthly income)",
      charges: [{ section: "457", act: "IPC", description: "Lurking at Night", max_years: 5, life_or_death: false }],
      next_action: "Generate S.440 surety reduction brief",
      confidence: 0.91,
      bail_success_probability: null,
      eligibility_status: "ELIGIBLE",
      countdown: { days: -120, display: "OVERDUE by 120 days", type: "overdue" },
      flags: ["OVERDUE", "SURETY_GAP"],
      state: "Tamil Nadu",
      court: "Sessions Court, Madurai",
      prison: "Madurai Central Prison",
      detention_days: 580,
      next_hearing_date: null,
      arrest_date: "2024-10-05",
    },
    {
      case_id: "uuid-4",
      case_number: "BR-2025-CR-10150",
      accused_name: "Arun Prasad",
      priority_score: 45.3,
      one_line_reason: "S.302 IPC — Murder charge — excluded from S.479 eligibility. Flagged for lawyer review.",
      charges: [{ section: "302", act: "IPC", description: "Murder", max_years: 100, life_or_death: true }],
      next_action: "Lawyer review required — life imprisonment charge",
      confidence: 0.95,
      bail_success_probability: 0.12,
      eligibility_status: "EXCLUDED",
      countdown: { days: null, display: "N/A — excluded charge", type: "na" },
      flags: ["LAWYER_REVIEW"],
      state: "Bihar",
      court: "Sessions Court, Patna",
      prison: "Beur Central Prison",
      detention_days: 310,
      next_hearing_date: "2026-04-20",
      arrest_date: "2025-06-05",
    },
    {
      case_id: "uuid-5",
      case_number: "WB-2024-CR-10200",
      accused_name: "Kamal Halder",
      priority_score: 81.9,
      one_line_reason: "Eligible — hearing tomorrow but court has 87% adjournment rate. Consider Case MH-2024-CR-10001 first.",
      charges: [{ section: "380", act: "IPC", description: "Theft in Dwelling", max_years: 7, life_or_death: false }],
      next_action: "Attend hearing — but high adjournment probability",
      confidence: 0.79,
      bail_success_probability: 0.55,
      eligibility_status: "ELIGIBLE",
      countdown: { days: -30, display: "OVERDUE by 30 days", type: "overdue" },
      flags: ["OVERDUE", "HIGH_ADJOURNMENT"],
      state: "West Bengal",
      court: "District Court, Kolkata",
      prison: "Presidency Correctional Home",
      detention_days: 450,
      next_hearing_date: "2026-04-12",
      arrest_date: "2025-01-17",
    },
  ],
  total: 5,
};

export const mockReasoningGraph = {
  nodes: [
    { id: "fir", label: "FIR Text", value: "Hindi FIR — S.379 IPC referenced in paragraph 3", confidence: 1.0, type: "input" },
    { id: "ocr", label: "OCR Processed", value: "Text extracted with 94% accuracy", confidence: 0.94, type: "process" },
    { id: "charges", label: "Charges Extracted", value: "S.379 IPC — Theft", confidence: 0.92, type: "process" },
    { id: "bnss", label: "BNSS Mapping", value: "S.379 IPC → S.303 BNS (equivalent)", confidence: 0.95, type: "data" },
    { id: "sentence", label: "Max Sentence", value: "3 years (1095 days)", confidence: 0.98, type: "data" },
    { id: "offender", label: "First Offender Check", value: "Yes — no prior convictions found", confidence: 0.88, type: "data" },
    { id: "threshold", label: "Threshold (⅓)", value: "365 days (1 year)", confidence: 0.95, type: "compute" },
    { id: "detention", label: "Current Detention", value: "412 days (1 year 47 days)", confidence: 1.0, type: "data" },
    { id: "delay", label: "Accused Delays", value: "0 days excluded", confidence: 1.0, type: "data" },
    { id: "multiple", label: "Multiple Cases Check", value: "No — only 1 pending case", confidence: 0.90, type: "data" },
    { id: "result", label: "ELIGIBLE ✅", value: "Exceeded threshold by 47 days", confidence: 0.87, type: "result" },
  ],
  edges: [
    { from: "fir", to: "ocr" },
    { from: "ocr", to: "charges" },
    { from: "charges", to: "bnss" },
    { from: "bnss", to: "sentence" },
    { from: "sentence", to: "threshold" },
    { from: "offender", to: "threshold" },
    { from: "threshold", to: "result" },
    { from: "detention", to: "result" },
    { from: "delay", to: "detention" },
    { from: "multiple", to: "result" },
  ],
};

export const mockPrisonHeatmap = {
  prisons: [
    { id: "p1", name: "Yerwada Central Prison", lat: 18.55, lng: 73.89, eligible_count: 142, total_count: 890, state: "Maharashtra" },
    { id: "p2", name: "Arthur Road Jail", lat: 18.96, lng: 72.83, eligible_count: 210, total_count: 1200, state: "Maharashtra" },
    { id: "p3", name: "Lucknow District Prison", lat: 26.85, lng: 80.95, eligible_count: 320, total_count: 1800, state: "Uttar Pradesh" },
    { id: "p4", name: "Beur Central Prison", lat: 25.58, lng: 85.18, eligible_count: 280, total_count: 2100, state: "Bihar" },
    { id: "p5", name: "Puzhal Central Prison", lat: 13.15, lng: 80.19, eligible_count: 95, total_count: 750, state: "Tamil Nadu" },
    { id: "p6", name: "Presidency Correctional Home", lat: 22.57, lng: 88.35, eligible_count: 180, total_count: 1100, state: "West Bengal" },
  ]
};

export const mockAnalytics = {
  chargeDetention: [
    { charge: "S.302 Murder", avg_days: 890, count: 320 },
    { charge: "S.307 Attempt Murder", avg_days: 620, count: 410 },
    { charge: "S.376 Rape", avg_days: 540, count: 280 },
    { charge: "S.392 Robbery", avg_days: 380, count: 520 },
    { charge: "S.420 Cheating", avg_days: 290, count: 680 },
    { charge: "S.379 Theft", avg_days: 210, count: 890 },
    { charge: "S.498A Cruelty", avg_days: 180, count: 420 },
    { charge: "S.506 Intimidation", avg_days: 120, count: 310 },
  ],
  courtPerformance: [
    { court: "Sessions Court, Varanasi", avg_bail_days: 87, adj_rate: 0.89 },
    { court: "Magistrate Court, Patna", avg_bail_days: 72, adj_rate: 0.85 },
    { court: "District Court, Muzaffarpur", avg_bail_days: 65, adj_rate: 0.82 },
    { court: "Sessions Court, Lucknow", avg_bail_days: 45, adj_rate: 0.71 },
    { court: "Sessions Court, Pune", avg_bail_days: 28, adj_rate: 0.55 },
  ],
};
```

---

### STEP 5 (Hours 1-3): Dashboard Layout

Create `app/(dashboard)/layout.tsx`:
```tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, Scale, BarChart3, Map, 
  Radio, MessageSquare, Shield, Settings, ChevronLeft, Bell
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Priority Queue', icon: LayoutDashboard },
  { href: '/cases', label: 'All Cases', icon: Users },
  { href: '/hearings', label: 'Hearings', icon: Calendar },
  { href: '/surety', label: 'Surety Gap', icon: Scale },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/heatmap', label: 'Prison Heatmap', icon: Map },
  { href: '/utrc', label: 'UTRC Dashboard', icon: Radio },
  { href: '/communicate', label: 'Communication', icon: MessageSquare },
  { href: '/admin/audit', label: 'Audit Log', icon: Shield },
  { href: '/admin/federation', label: 'Federation', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-jg-surface border-r border-jg-border 
                         flex flex-col transition-all duration-300 shrink-0`}>
        <div className="p-4 border-b border-jg-border flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-jg-blue">⚖️ JusticeGrid</h1>
              <p className="text-xs text-jg-text-secondary">Legal Intelligence</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-jg-text-secondary hover:text-jg-text">
            <ChevronLeft className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-all
                  ${isActive 
                    ? 'bg-jg-blue/10 text-jg-blue border border-jg-blue/20' 
                    : 'text-jg-text-secondary hover:bg-jg-surface-hover hover:text-jg-text'
                  }`}>
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        
        {/* User info */}
        {!collapsed && (
          <div className="p-4 border-t border-jg-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-jg-blue/20 flex items-center justify-center text-jg-blue text-sm font-bold">P</div>
              <div>
                <p className="text-sm font-medium">Priya Sharma</p>
                <p className="text-xs text-jg-text-secondary">Paralegal</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-jg-bg">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-jg-bg/80 backdrop-blur-lg border-b border-jg-border px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{navItems.find(i => i.href === pathname)?.label || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-jg-green bg-jg-green/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-jg-green animate-pulse" />
              Online
            </div>
            <button className="relative text-jg-text-secondary hover:text-jg-text">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-jg-red text-white text-[10px] rounded-full flex items-center justify-center">3</span>
            </button>
          </div>
        </header>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

```bash
cd frontend
git add .
git commit -m "Frontend foundation: Next.js + design system + layout + mock data"
git push
```

**→ Message group: "PUSHED — Frontend skeleton is live. Dark theme dashboard with sidebar. Run: cd frontend && npm run dev"**

---

### STEP 6 (Hours 3-8): Priority Queue + Countdown Clock

This is the MOST IMPORTANT page. It's the first thing judges see.

Create `components/countdown-clock.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';

interface CountdownProps {
  days: number | null;
  type: 'overdue' | 'upcoming' | 'na';
}

export function CountdownClock({ days, type }: CountdownProps) {
  const [tick, setTick] = useState(false);
  
  useEffect(() => {
    if (type === 'overdue') {
      const interval = setInterval(() => setTick(t => !t), 1000);
      return () => clearInterval(interval);
    }
  }, [type]);

  if (type === 'na' || days === null) {
    return (
      <div className="text-xs text-jg-text-secondary bg-jg-surface-hover px-3 py-1.5 rounded-full">
        N/A — Excluded
      </div>
    );
  }

  if (type === 'overdue') {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                        bg-jg-red/15 text-jg-red border border-jg-red/30
                        ${tick ? 'pulse-danger' : ''}`}>
        <span className="text-base">⚠️</span>
        <span>OVERDUE by {Math.abs(days)} days</span>
      </div>
    );
  }

  // Upcoming
  const color = days <= 7 ? 'jg-red' : days <= 30 ? 'jg-amber' : 'jg-green';
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                      bg-${color}/15 text-${color} border border-${color}/30`}>
      <span className="text-base">⏰</span>
      <span>Eligible in {days} days</span>
    </div>
  );
}
```

Create `app/(dashboard)/page.tsx` — Priority Queue home:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { CountdownClock } from '@/components/countdown-clock';
import { fetchAPI } from '@/lib/api-client';
import { mockCaseQueue } from '@/lib/mock-data';
import Link from 'next/link';
import { ChevronRight, Search, Filter, AlertTriangle } from 'lucide-react';

export default function PriorityQueuePage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCases() {
      const data = await fetchAPI('/api/v1/cases/queue?limit=50');
      if (data?.cases) {
        setCases(data.cases);
      } else {
        // Fallback to mock data
        setCases(mockCaseQueue.cases);
      }
      setLoading(false);
    }
    loadCases();
  }, []);

  const filteredCases = cases.filter(c => 
    c.case_number.toLowerCase().includes(search.toLowerCase()) ||
    c.accused_name.toLowerCase().includes(search.toLowerCase())
  );

  function getPriorityColor(score: number) {
    if (score >= 90) return 'bg-jg-red/15 text-jg-red border-jg-red/30';
    if (score >= 70) return 'bg-jg-amber/15 text-jg-amber border-jg-amber/30';
    if (score >= 50) return 'bg-jg-blue/15 text-jg-blue border-jg-blue/30';
    return 'bg-jg-surface-hover text-jg-text-secondary border-jg-border';
  }

  function getPriorityLabel(score: number) {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    return 'LOW';
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-pulse">
            <div className="h-4 bg-jg-surface-hover rounded w-1/3 mb-3" />
            <div className="h-3 bg-jg-surface-hover rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Stats summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Active', value: cases.length, color: 'jg-blue' },
          { label: 'Eligible', value: cases.filter(c => c.eligibility_status === 'ELIGIBLE').length, color: 'jg-green' },
          { label: 'Overdue', value: cases.filter(c => c.countdown?.type === 'overdue').length, color: 'jg-red' },
          { label: 'Hearing This Week', value: cases.filter(c => c.flags?.includes('HEARING_SOON')).length, color: 'jg-amber' },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4">
            <p className="text-jg-text-secondary text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-jg-text-secondary" />
          <input 
            type="text" placeholder="Search by case number or name..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-jg-surface border border-jg-border rounded-btn text-sm
                       focus:outline-none focus:border-jg-blue placeholder:text-jg-text-secondary"
          />
        </div>
      </div>

      {/* Case list */}
      <div className="space-y-3">
        {filteredCases.map((c, i) => (
          <Link key={c.case_id} href={`/cases/${c.case_id}`}
            className="glass-card p-4 flex items-center gap-4 hover:bg-jg-surface-hover/50 
                       transition-all cursor-pointer group">
            
            {/* Priority badge */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0
                             ${getPriorityColor(c.priority_score)}`}>
              {getPriorityLabel(c.priority_score)}
              <br />
              <span className="text-[11px]">{c.priority_score?.toFixed(1)}</span>
            </div>
            
            {/* Case info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{c.case_number}</span>
                <span className="text-xs text-jg-text-secondary">• {c.accused_name}</span>
                {c.flags?.includes('LAWYER_REVIEW') && (
                  <span className="text-[10px] bg-jg-amber/20 text-jg-amber px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Lawyer Review
                  </span>
                )}
              </div>
              <p className="text-xs text-jg-text-secondary truncate">{c.one_line_reason}</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-jg-text-secondary">
                <span>📍 {c.state}</span>
                <span>🏛️ {c.court}</span>
                <span>📅 {c.detention_days}d detained</span>
                {c.confidence > 0 && (
                  <span className="text-jg-blue">🎯 {(c.confidence * 100).toFixed(0)}% confidence</span>
                )}
              </div>
            </div>
            
            {/* Countdown */}
            <CountdownClock days={c.countdown?.days} type={c.countdown?.type} />
            
            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-jg-text-secondary group-hover:text-jg-blue transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
```

```bash
git add .
git commit -m "Priority Queue page with Countdown Clock, search, stats cards"
git push
```

**→ Message group: "PUSHED — Priority Queue UI is live with Countdown Clocks! Run frontend to see it."**

---

### What to Build Next (Follow TEAM_SPLIT.md for detailed hour-by-hour)

**Hours 8-14**: Case Detail page + Reasoning Graph + Bail Success Card
**Hours 14-20**: Prison Heatmap (Leaflet) + Analytics page (Recharts charts)
**Hours 20-26**: UTRC Dashboard + Surety page + Hearings calendar
**Hours 26-32**: WhatsApp Chat Simulator + IVR Simulator
**Hours 32-38**: Admin pages (audit, federation, data lifecycle, health)
**Hours 38-44**: Offline PWA + responsive + animations + polish

### Switching from Mock Data to Real API

When Laptop A messages that an API is ready:

1. Open the relevant page component
2. Replace `mockData` usage with the `fetchAPI()` call
3. Verify the shapes match
4. If shapes differ, tell Laptop A what you need

Example:
```typescript
// BEFORE (mock):
setCases(mockCaseQueue.cases);

// AFTER (real):
const data = await fetchAPI('/api/v1/cases/queue?limit=50');
setCases(data.cases);
```

The mock data file stays as fallback — `fetchAPI` returns null on error, and your components check:
```typescript
if (data?.cases) {
  setCases(data.cases);  // Real API
} else {
  setCases(mockCaseQueue.cases);  // Mock fallback
}
```
