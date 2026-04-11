'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Settings,
  ChevronLeft,
  Bell,
  Activity,
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
  { href: '/admin/health', label: 'System Health', icon: Activity },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const currentPage = navItems.find((i) => {
    if (i.href === '/') return pathname === '/';
    return pathname.startsWith(i.href);
  });

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-64'} bg-jg-surface border-r border-jg-border
                     flex flex-col transition-all duration-300 shrink-0`}
      >
        <div className="p-4 border-b border-jg-border flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-jg-blue flex items-center gap-2">
                <span>⚖️</span> JusticeGrid
              </h1>
              <p className="text-[10px] text-jg-text-secondary tracking-wider uppercase mt-0.5">
                Legal Intelligence Platform
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-jg-text-secondary hover:text-jg-text p-1 rounded-md hover:bg-jg-surface-hover transition-colors"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                  ${
                    isActive
                      ? 'bg-jg-blue/10 text-jg-blue border border-jg-blue/20'
                      : 'text-jg-text-secondary hover:bg-jg-surface-hover hover:text-jg-text border border-transparent'
                  }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {!collapsed && (
          <div className="p-4 border-t border-jg-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-jg-blue to-jg-purple flex items-center justify-center text-white text-sm font-bold shadow-lg">
                P
              </div>
              <div>
                <p className="text-sm font-medium text-jg-text">
                  Priya Sharma
                </p>
                <p className="text-[11px] text-jg-text-secondary">
                  Paralegal • DLSA Pune
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-jg-bg">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-jg-bg/80 backdrop-blur-xl border-b border-jg-border px-6 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-jg-text">
              {currentPage?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-jg-green bg-jg-green/10 px-3 py-1.5 rounded-full border border-jg-green/20">
              <div className="w-2 h-2 rounded-full bg-jg-green animate-pulse" />
              Online
            </div>
            <button className="relative text-jg-text-secondary hover:text-jg-text transition-colors p-1.5 rounded-lg hover:bg-jg-surface-hover">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-jg-red text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
