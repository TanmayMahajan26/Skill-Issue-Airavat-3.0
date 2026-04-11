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
      const interval = setInterval(() => setTick((t) => !t), 1000);
      return () => clearInterval(interval);
    }
  }, [type]);

  if (type === 'na' || days === null) {
    return (
      <div className="text-xs text-jg-text-secondary bg-jg-surface-hover/50 px-3 py-1.5 rounded-full border border-jg-border/50">
        N/A — Excluded
      </div>
    );
  }

  if (type === 'overdue') {
    const absDays = Math.abs(days);
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                    badge-critical ${tick ? 'pulse-danger' : ''}`}
      >
        <span className="text-base">⚠️</span>
        <span>OVERDUE by {absDays} days</span>
      </div>
    );
  }

  // Upcoming
  const isUrgent = days <= 7;
  const isWarning = days <= 30;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                  ${
                    isUrgent
                      ? 'badge-critical'
                      : isWarning
                        ? 'badge-high'
                        : 'badge-eligible'
                  }`}
    >
      <span className="text-base">⏰</span>
      <span>Eligible in {days} days</span>
    </div>
  );
}
