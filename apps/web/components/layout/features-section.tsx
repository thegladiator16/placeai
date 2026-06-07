import React from 'react';
import { FileSearch, Users, MessageSquare, Mic2, KanbanSquare, Brain } from 'lucide-react';

type Feature = {
  icon: React.ComponentType<{ className?: string | undefined }>;
  title: string;
  description: string;
  color: string;
  bg: string;
  badge?: string;
};

const FEATURES: Feature[] = [
  {
    icon: FileSearch,
    title: 'ATS Score Engine',
    description: 'Instant 0–100 ATS score vs any job description. Know exactly why you got rejected before you apply.',
    color: 'text-brand',
    bg: 'bg-brand/10',
  },
  {
    icon: Users,
    title: 'Referral Discovery',
    description: 'Find college alumni at your target companies. The only tool in India with a referral engine.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    badge: 'Unique',
  },
  {
    icon: Brain,
    title: 'AI Resume Optimizer',
    description: 'Rewrite bullets with quantified metrics. Inject missing keywords. One-click ATS optimization.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Mic2,
    title: 'Interview Prep',
    description: 'Role-specific mock interviews with AI feedback. Company-tailored questions for Zepto, CRED, Google.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: KanbanSquare,
    title: 'Job Tracker',
    description: 'Drag-and-drop Kanban to track every application. Never lose track of a follow-up again.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: MessageSquare,
    title: 'Recruiter Outreach',
    description: 'AI-written LinkedIn DM sequences. Cold email scripts. Personalized for your target role.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 border-t border-border/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Every tool you need,{' '}
            <span className="text-gradient">in one place</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Stop juggling 5 different tools. PlaceAI covers your entire job search from resume to offer letter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color, bg, badge }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-xl p-6 hover:border-border/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${bg} w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {badge && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {badge}
                  </span>
                )}
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
