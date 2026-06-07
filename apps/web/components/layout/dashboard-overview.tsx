'use client';

import { useUser } from '@/hooks/use-user';
import { FileText, Briefcase, TrendingUp, Calendar } from 'lucide-react';

const STAT_CARDS = [
  { label: 'Resume Score', value: '—', icon: FileText, color: 'text-brand' },
  { label: 'Applications', value: '0', icon: Briefcase, color: 'text-accent' },
  { label: 'Interviews', value: '0', icon: TrendingUp, color: 'text-yellow-500' },
  { label: 'Days Active', value: '1', icon: Calendar, color: 'text-purple-400' },
] as const;

export function DashboardOverview({ clerkId: _clerkId }: { clerkId: string }) {
  const { user, isLoading, tier } = useUser();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 shimmer rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          You&apos;re on the{' '}
          <span className="text-brand font-medium capitalize">{tier}</span> plan.
          {tier === 'free' && (
            <a href="/upgrade" className="ml-1 underline text-brand hover:text-brand-light">
              Upgrade to unlock more
            </a>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className={`${color} mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="font-mono text-2xl font-bold text-foreground">{value}</div>
            <div className="text-muted-foreground text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/resume"
            className="block bg-card border border-border rounded-xl p-4 hover:border-brand/50 transition-colors group"
          >
            <FileText className="w-5 h-5 text-brand mb-2" />
            <div className="font-medium text-foreground group-hover:text-brand transition-colors">
              Upload Resume
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Get your ATS score in seconds
            </div>
          </a>
          <a
            href="/jobs"
            className="block bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors group"
          >
            <Briefcase className="w-5 h-5 text-accent mb-2" />
            <div className="font-medium text-foreground group-hover:text-accent transition-colors">
              Browse Jobs
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              AI-matched roles for you
            </div>
          </a>
          <a
            href="/interviews"
            className="block bg-card border border-border rounded-xl p-4 hover:border-yellow-500/50 transition-colors group"
          >
            <TrendingUp className="w-5 h-5 text-yellow-500 mb-2" />
            <div className="font-medium text-foreground group-hover:text-yellow-500 transition-colors">
              Practice Interview
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              AI-powered mock sessions
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
