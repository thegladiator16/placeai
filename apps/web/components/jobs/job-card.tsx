'use client';

import { MapPin, Clock, Banknote, Zap } from 'lucide-react';
import type { JobItem } from './job-board';

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  if (!min && !max) return '';
  const fmt = (n: number) => n >= 100000 ? `${(n / 100000).toFixed(0)}L` : `${n}`;
  const c = currency === 'INR' ? '₹' : (currency ?? '');
  if (min && max) return `${c}${fmt(min)}–${fmt(max)}`;
  if (min) return `${c}${fmt(min)}+`;
  return `Up to ${c}${fmt(max!)}`;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

type Props = {
  job: JobItem;
  matchScore?: number;
  onClick: () => void;
};

export function JobCard({ job, matchScore, onClick }: Props) {
  const location = job.locations[0];
  const locationStr = location?.isRemote ? 'Remote' : location?.city ?? '';
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  const scoreColor = matchScore === undefined ? '' : matchScore >= 75 ? 'text-accent' : matchScore >= 50 ? 'text-brand' : 'text-muted-foreground';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 space-y-3 hover:border-brand/40 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground group-hover:text-brand transition-colors truncate">{job.title}</p>
          <p className="text-sm text-muted-foreground">{job.companyName}</p>
        </div>
        {matchScore !== undefined && (
          <div className="flex-shrink-0 text-right">
            <div className={`text-lg font-bold ${scoreColor}`}>{matchScore}%</div>
            <div className="text-[10px] text-muted-foreground">match</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {locationStr && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{locationStr}</span>
        )}
        {job.workMode && (
          <span className="flex items-center gap-1 capitalize"><Clock className="w-3 h-3" />{job.workMode}</span>
        )}
        {salary && (
          <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{salary}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(job.requiredSkills ?? []).slice(0, 4).map((s) => (
          <span key={s} className="px-2 py-0.5 bg-background border border-border rounded-md text-xs text-muted-foreground">{s}</span>
        ))}
        {(job.requiredSkills ?? []).length > 4 && (
          <span className="px-2 py-0.5 text-xs text-muted-foreground">+{(job.requiredSkills ?? []).length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{job.department}</span>
        <span className="flex items-center gap-1">
          {job.experienceMin !== null && job.experienceMax !== null && `${job.experienceMin}–${job.experienceMax} yrs`}
          <span className="ml-1.5">{timeAgo(job.postedAt)}</span>
        </span>
      </div>

      {matchScore !== undefined && matchScore >= 75 && (
        <div className="flex items-center gap-1 text-xs text-accent font-medium">
          <Zap className="w-3 h-3" />Strong match — apply now
        </div>
      )}
    </button>
  );
}
