import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Users,
  Brain,
  Mic2,
  KanbanSquare,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Features — PlaceAI',
  description:
    'Six AI-powered tools for Indian engineering students: ATS scoring, referral discovery, resume optimization, interview prep, job tracking, and recruiter outreach.',
};

type Feature = {
  icon: React.ComponentType<{ className?: string | undefined }>;
  title: string;
  color: string;
  bg: string;
  badge?: string;
  description: string;
  bullets: string[];
};

const FEATURES: Feature[] = [
  {
    icon: FileSearch,
    title: 'ATS Score Engine',
    color: 'text-brand',
    bg: 'bg-brand/10',
    description:
      'Get an instant 0–100 ATS compatibility score for any resume against any job description. Stop wondering why you got rejected — know exactly what to fix before you apply.',
    bullets: [
      'Keyword match analysis with weighting by frequency and recency',
      'Format-issue detection: tables, columns, headers, fonts',
      'Section-by-section scoring (experience, skills, education)',
      'Live JD comparison with missing-keyword highlights',
    ],
  },
  {
    icon: Users,
    title: 'Referral Discovery',
    color: 'text-accent',
    bg: 'bg-accent/10',
    badge: 'Unique to India',
    description:
      'The only tool in India with a college-alumni referral engine. Find people from your college working at Zepto, CRED, Google India — and reach out the right way.',
    bullets: [
      'Searches across 500+ verified alumni profiles',
      'Filters by college, graduation year, and current company',
      'AI-drafted personalized outreach messages',
      'Track outreach status: sent, replied, referred',
    ],
  },
  {
    icon: Brain,
    title: 'AI Resume Optimizer',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    description:
      'Claude rewrites every bullet with quantified metrics, action verbs, and missing keywords. One click turns "Worked on backend systems" into "Built REST APIs serving 50K requests/day."',
    bullets: [
      'Bullet rewriter with STAR/XYZ format',
      'Quantified-metric injection (numbers, percentages, scale)',
      'Keyword density optimizer aligned to target JD',
      'ATS-friendly templates with proven formatting',
    ],
  },
  {
    icon: Mic2,
    title: 'Interview Prep',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    description:
      'Role-specific and company-tailored mock interviews. AI generates questions asked at Zepto, CRED, Razorpay, Google India — and scores your answers on clarity, structure, and depth.',
    bullets: [
      'Behavioral, technical, company, and HR question banks',
      'AI feedback per answer with improvement tips',
      'Radar chart of strengths across dimensions',
      'Session history with retake-and-improve loops',
    ],
  },
  {
    icon: KanbanSquare,
    title: 'Job Tracker',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    description:
      'Drag-and-drop Kanban for every application. Never lose track of a follow-up, an interview round, or an offer deadline again.',
    bullets: [
      'Five status columns: Saved, Applied, Interview, Offer, Rejected',
      'Per-application notes, interviewer names, salary band',
      'Follow-up reminders synced with your interview dates',
      'CSV export and analytics dashboard',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Recruiter Outreach',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    description:
      'Generate 3-step LinkedIn or email outreach sequences in one click. Connection request → follow-up DM → "checking in" email — all personalized to the recruiter and role.',
    bullets: [
      'Channel-specific message tuning (LinkedIn vs email)',
      'Tone control: professional, enthusiastic, concise',
      'Edit before sending, copy with one click',
      'Tracks response rate per recruiter and template',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Everything you need to <span className="text-gradient">land your dream job</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Six AI-powered tools built specifically for Indian engineering students. From
            ATS optimization to alumni referrals to mock interviews — all in one place.
          </p>
        </div>
      </section>

      <div className="space-y-24 md:space-y-32 py-12">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          const reversed = idx % 2 === 1;
          return (
            <section key={feature.title} className="px-4">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={reversed ? 'lg:order-2' : ''}>
                  <div className={'inline-flex h-12 w-12 items-center justify-center rounded-xl ' + feature.bg}>
                    <Icon className={'h-6 w-6 ' + feature.color} />
                  </div>
                  {feature.badge ? (
                    <span className="ml-3 inline-block bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-full align-middle">
                      {feature.badge}
                    </span>
                  ) : null}
                  <h2 className="mt-4 text-3xl md:text-4xl font-display font-bold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-foreground/90">
                        <span className={'mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ' + feature.color.replace('text-', 'bg-')} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition"
                  >
                    Try it free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className={reversed ? 'lg:order-1' : ''}>
                  <div
                    className={
                      'h-64 md:h-80 rounded-2xl border border-border/50 ' +
                      feature.bg +
                      ' flex items-center justify-center relative overflow-hidden'
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/40" />
                    <Icon className={'h-20 w-20 ' + feature.color + ' relative z-10'} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="py-20 px-4 border-t border-border/50 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Try every feature <span className="text-gradient">free for 7 days</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            No credit card. No commitments. Cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-brand px-8 py-4 text-base font-medium text-white hover:bg-brand-dark transition"
          >
            Get started free
          </Link>
        </div>
      </section>
    </>
  );
}
