'use client';

import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Banknote, Briefcase, CheckCircle, XCircle, Loader2, ExternalLink, BookmarkPlus, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { JobItem } from './job-board';

type MatchResult = {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch: boolean;
  recommendation: string;
};

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} per annum`;
  if (min) return `${fmt(min)}+ per annum`;
  return `Up to ${fmt(max!)} per annum`;
}

type Props = {
  job: JobItem;
  userExp: number;
  onClose: () => void;
};

export function JobDetailModal({ job, userExp, onClose }: Props) {
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/v1/jobs/${job.id}/match`);
        const json = await res.json() as { success: boolean; data?: MatchResult };
        if (json.success && json.data) setMatch(json.data);
      } finally {
        setMatchLoading(false);
      }
    })();
  }, [job.id]);

  const saveJob = async () => {
    setSaving(true);
    try {
      await fetch('/api/v1/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          companyName: job.companyName,
          status: 'saved',
          priority: 'medium',
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const location = job.locations[0];
  const locationStr = location?.isRemote ? 'Remote' : [location?.city, 'India'].filter(Boolean).join(', ');

  const scoreColor = !match ? '' : match.overallScore >= 75 ? 'text-accent' : match.overallScore >= 50 ? 'text-brand' : 'text-yellow-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg text-foreground">{job.title}</h2>
            <p className="text-muted-foreground">{job.companyName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {locationStr && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{locationStr}</span>}
            {job.workMode && <span className="flex items-center gap-1.5 capitalize"><Clock className="w-4 h-4" />{job.workMode}</span>}
            <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4" />{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
            {job.experienceMin !== null && job.experienceMax !== null && (
              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{job.experienceMin}–{job.experienceMax} years</span>
            )}
          </div>

          {/* Match score */}
          <div className="bg-background border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-3">Your Match</p>
            {matchLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</div>
            ) : match ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${scoreColor}`}>{match.overallScore}%</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{match.recommendation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Skills: {match.skillScore}% · Experience: {match.experienceMatch ? 'Fits' : 'Stretch'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {match.matchedSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-accent mb-1.5 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />You have</p>
                      <div className="flex flex-wrap gap-1">
                        {match.matchedSkills.slice(0, 6).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-md text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.missingSkills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-1.5 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />Missing</p>
                      <div className="flex flex-wrap gap-1">
                        {match.missingSkills.slice(0, 6).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Upload a resume to see your match score.</p>
            )}
          </div>

          {/* Required skills */}
          {(job.requiredSkills ?? []).length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(job.requiredSkills ?? []).map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-background border border-border rounded-lg text-xs text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">About the Role</p>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Requirements</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {job.responsibilities && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Responsibilities</p>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-2">
          <button
            onClick={() => void saveJob()}
            disabled={saving || saved}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {saved ? <><CheckCheck className="w-4 h-4 text-accent" />Saved</> : saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
            {!saved && !saving && 'Save Job'}
          </button>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.companyName} job apply`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Apply Now
          </a>
        </div>
      </motion.div>
    </div>
  );
}
