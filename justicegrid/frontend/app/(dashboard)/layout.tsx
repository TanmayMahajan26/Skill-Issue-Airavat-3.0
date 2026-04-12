'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Scale,
  BarChart3,
  Map,
  Radio,
  MessageSquare,
  Shield,
  ChevronLeft,
  Bell,
  LogOut,
  AlertTriangle,
  Zap,
  ClipboardCheck,
  Activity,
  Settings,
  Heart,
} from 'lucide-react';

import { ChatbotAssistant } from '@/components/chatbot-assistant';

/* ── Navigation Groups ────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    title: 'FAMILY ASSISTANCE',
    items: [
      { href: '/',               label: 'My Case Status',   icon: Heart,       roles: ['family'] },
      { href: '/understand-bail',label: 'Understand Bail',  icon: Scale,       roles: ['family'] },
      { href: '/help',           label: 'Help & Support',   icon: Radio,       roles: ['family'] },
    ],
  },
  {
    title: 'CASE MANAGEMENT',
    items: [
      { href: '/',           label: 'Priority Queue',   icon: LayoutDashboard, roles: ['paralegal'] },
      { href: '/cases',      label: 'All Cases',        icon: Users,           roles: ['paralegal','lawyer'] },
      { href: '/hearings',   label: 'Hearings',         icon: Calendar,        roles: ['paralegal','lawyer'] },
      { href: '/surety',     label: 'Surety Gap',       icon: Scale,           roles: ['paralegal','lawyer'] },
    ],
  },
  {
    title: 'LEGAL INTELLIGENCE',
    items: [
      { href: '/alerts',     label: 'Active Alerts',    icon: AlertTriangle,   roles: ['paralegal','lawyer','supervisor','utrc','admin'] },
      { href: '/petitions',  label: 'Petition Drafter',  icon: Zap,             roles: ['paralegal','lawyer'] },
      { href: '/checklist',  label: 'Bail Checklist',    icon: ClipboardCheck,  roles: ['paralegal','lawyer','family'] },
    ],
  },
  {
    title: 'OVERVIEW',
    items: [
      { href: '/',           label: 'Flagged Cases',    icon: Shield,          roles: ['lawyer'] },
      { href: '/',           label: 'UTRC Dashboard',   icon: Radio,           roles: ['utrc'] },
      { href: '/',           label: 'Oversight',        icon: Shield,          roles: ['supervisor'] },
      { href: '/',           label: 'Admin Console',    icon: Settings,        roles: ['admin'] },
    ],
  },
  {
    title: 'ANALYTICS & REVIEW',
    items: [
      { href: '/analytics',  label: 'Analytics',        icon: BarChart3,       roles: ['supervisor','utrc','admin'] },
      { href: '/heatmap',    label: 'Prison Heatmap',   icon: Map,             roles: ['supervisor','utrc','admin'] },
      { href: '/utrc',       label: 'UTRC Panel',       icon: Radio,           roles: ['utrc','admin'] },
      { href: '/hearings',   label: 'Hearing Conflicts', icon: Calendar,       roles: ['utrc'] },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { href: '/communicate', label: 'Communication',   icon: MessageSquare,   roles: ['paralegal','lawyer','supervisor','admin'] },
      { href: '/admin/audit', label: 'Audit Log',        icon: Shield,          roles: ['supervisor','admin'] },
      { href: '/admin/federation', label: 'Federation',  icon: Settings,        roles: ['admin'] },
      { href: '/admin/health', label: 'System Health',   icon: Activity,        roles: ['admin'] },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  paralegal: 'DLSA Paralegal',
  lawyer: 'NALSA Panel Lawyer',
  supervisor: 'DLSA Supervisor',
  utrc: 'UTRC Coordinator',
  family: 'Family Member',
  admin: 'System Admin',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-jg-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-jg-blue/30 border-t-jg-blue rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-jg-text-secondary">Loading JusticeGrid...</p>
        </div>
      </div>
    );
  }

  const initials = user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`${collapsed ? 'w-[68px]' : 'w-[260px]'} bg-jg-bg-alt border-r border-jg-border
                     flex flex-col transition-all duration-300 shrink-0 relative`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between h-16">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-indigo flex items-center justify-center text-white font-bold text-sm shadow-lg">
                ⚖
              </div>
              <div>
                <h1 className="text-sm font-bold text-jg-text">JusticeGrid</h1>
                <p className="text-[9px] text-jg-text-tertiary tracking-wide uppercase">Legal Intelligence</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg gradient-indigo flex items-center justify-center text-white font-bold text-sm mx-auto">
              ⚖
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-jg-text-secondary hover:text-jg-text p-1 rounded-md hover:bg-jg-surface-hover transition-colors absolute right-2 top-4"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {NAV_GROUPS.map((group) => {
            const items = group.items.filter((i) => i.roles.includes(user.role));
            if (items.length === 0) return null;
            return (
              <div key={group.title}>
                {!collapsed && (
                  <p className="px-3 mb-1.5 text-[10px] font-semibold text-jg-text-tertiary tracking-wider">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all
                          ${isActive
                            ? 'nav-active font-medium'
                            : 'nav-item text-jg-text-secondary hover:text-jg-text'
                          }
                          ${collapsed ? 'justify-center px-2' : ''}
                        `}
                      >
                        <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-jg-blue' : ''}`} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-jg-border">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jg-blue to-jg-purple flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-jg-text truncate">{user.name}</p>
                <p className="text-[10px] text-jg-text-tertiary truncate">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => { logout(); router.replace('/login'); }}
                title="Sign out"
                className="text-jg-text-secondary hover:text-jg-red p-1 rounded-lg hover:bg-jg-surface-hover transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 overflow-y-auto bg-jg-bg">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-jg-bg/80 backdrop-blur-xl border-b border-jg-border px-6 h-14 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-jg-text">
              {NAV_GROUPS.flatMap(g => g.items).find(i => i.roles.includes(user.role) && (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href)))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {['paralegal','lawyer'].includes(user.role) && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-jg-green bg-jg-green/8 px-3 py-1 rounded-full border border-jg-green/15">
                <div className="w-1.5 h-1.5 rounded-full bg-jg-green animate-pulse" />
                {user.total_assigned || user.assigned_cases || 0} Cases Assigned
              </div>
            )}
            {user.role === 'utrc' && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-jg-purple bg-jg-purple/8 px-3 py-1 rounded-full border border-jg-purple/15">
                <div className="w-1.5 h-1.5 rounded-full bg-jg-purple animate-pulse" />
                UTRC Coordinator
              </div>
            )}
            {user.role === 'supervisor' && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-jg-amber bg-jg-amber/8 px-3 py-1 rounded-full border border-jg-amber/15">
                <div className="w-1.5 h-1.5 rounded-full bg-jg-amber animate-pulse" />
                DLSA Oversight
              </div>
            )}
            {user.role === 'admin' && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-jg-blue bg-jg-blue/8 px-3 py-1 rounded-full border border-jg-blue/15">
                <div className="w-1.5 h-1.5 rounded-full bg-jg-blue animate-pulse" />
                System Admin
              </div>
            )}
            <Link
              href="/alerts"
              className="relative text-jg-text-secondary hover:text-jg-text transition-colors p-1.5 rounded-lg hover:bg-jg-surface-hover"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-jg-red text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                !
              </span>
            </Link>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
      
      {/* Inject the AI Chatbot Assistant globally here */}
      <ChatbotAssistant />
    </div>
  );
}
