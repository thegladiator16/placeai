'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Zap, Briefcase, Mic2, Users, TrendingUp, ArrowRight, Crown } from 'lucide-react';
import type { User } from '@placeai/db';
import { PLAN_LIMITS } from '@placeai/types';
import type { SubscriptionTier } from '@placeai/types';

type Stats = { resumes: number; analyses: number; applications: number; interviews: number };
type Props = { user: User; stats: Stats };

const QUICK_ACTIONS = [
  { icon: Zap, label: 'Analyze ATS Score', desc: 'Check your resume vs any JD', href: '/resume', color: 'text-brand', bg: 'bg-brand/10' },
  { icon: Briefcase, label: 'Track Application', desc: 'Add a job to your Kanban', href: '/tracker', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Mic2, label: 'Practice Interview', desc: 'Mock with AI feedback', href: '/interviews', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { icon: Users, label: 'Find Referral', desc: 'Alumni at your target company', href: '/referrals', color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

const STAT_CARDS = [
  { key: 'resumes' as const, label: 'Resumes', icon: FileText, color: 'text-brand', href: '/resume' },
  { key: 'analyses' as const, label: 'ATS Analyses', icon: Zap, color: 'text-accent', href: '/resume' },
  { key: 'applications' as const, label: 'Applications', icon: Briefcase, color: 'text-purple-400', href: '/tracker' },
  { key: 'interviews' as const, label: 'Interviews', icon: Mic2, color: 'text-yellow-500', href: '/interviews' },
];

export function DashboardHome({ user, stats }: Props) {
  const tier = (user.subscriptionTier ?? 'free') as SubscriptionTier;
  const limits = PLAN_LIMITS[tier];
  const isFree = tier === 'free';
  const atsUsed = stats.analyses;
  const atsLimit = limits.atsAnalysesPerMonth;
  const atsPercent = atsLimit === -1 ? 0 : Math.min(100, (atsUsed / atsLimit) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Good {getTimeOfDay()}, {user.fullName?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {isFree ? 'Free plan · Upgrade to unlock unlimited access' : `${tier.charAt(0).toUpperCase() + tier.slice(1)} plan · Keep it up!`}
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, href }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link href={href} className="block bg-card border border-border rounded-xl p-4 hover:border-brand/40 transition-colors group">
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <p className="text-2xl font-bold text-foreground">{stats[key]}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ icon: Icon, label, desc, href, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.07 }}>
              <Link href={href} className="flex flex-col gap-3 p-4 bg-card border border-border rounded-xl hover:border-brand/40 transition-colors group">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-brand transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Usage + Upgrade (free users) */}
      {isFree && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-brand/5 to-accent/5 border border-brand/20 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-foreground">Your Usage This Month</span>
              </div>
              <div className="space-y-2 mt-3">
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>ATS Analyses</span>
                    <span>{atsUsed} / {atsLimit}</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${atsPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <Link href="/pricing" className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition-colors">
              <Crown className="w-3.5 h-3.5" /> Upgrade
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Upgrade to <span className="text-brand font-medium">Starter (₹299/mo)</span> for 30 ATS analyses, 50 AI rewrites, and referral discovery.
          </p>
        </motion.div>
      )}

      {/* CTA: upload resume if none */}
      {stats.resumes === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="border-2 border-dashed border-border rounded-xl p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">Upload your first resume</p>
          <p className="text-sm text-muted-foreground mt-1">Get your ATS score and start optimizing in minutes.</p>
          <Link href="/resume" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium text-sm transition-colors">
            Upload Resume <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}
