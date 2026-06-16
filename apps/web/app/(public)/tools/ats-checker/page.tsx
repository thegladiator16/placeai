'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'at',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
  'can', 'this', 'that', 'these', 'those', 'i', 'you', 'we', 'they', 'he',
  'she', 'it', 'as', 'by', 'from', 'up', 'down', 'out', 'into', 'over',
  'about', 'against', 'between', 'through', 'during', 'before', 'after',
  'above', 'below', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'just', 'also', 'our', 'your', 'their',
  'his', 'her', 'its', 'my',
]);

function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9+#.\-]+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
  return new Set(tokens);
}

type Result = {
  score: number;
  matched: string[];
  missing: string[];
};

function computeScore(resume: string, jd: string): Result {
  const resumeTokens = tokenize(resume);
  const jdTokens = tokenize(jd);
  const matched: string[] = [];
  const missing: string[] = [];
  jdTokens.forEach((t) => {
    if (resumeTokens.has(t)) matched.push(t);
    else missing.push(t);
  });
  const score = jdTokens.size === 0 ? 0 : Math.round((matched.length / jdTokens.size) * 100);
  return {
    score,
    matched: matched.sort((a, b) => b.length - a.length).slice(0, 40),
    missing: missing.sort((a, b) => b.length - a.length).slice(0, 20),
  };
}

function verdict(score: number): { label: string; color: string; icon: typeof CheckCircle2 } {
  if (score >= 75) return { label: 'Excellent match', color: 'text-accent', icon: CheckCircle2 };
  if (score >= 50) return { label: 'Good match — room to improve', color: 'text-yellow-500', icon: Sparkles };
  return { label: 'Needs work', color: 'text-pink-400', icon: XCircle };
}

export default function AtsCheckerPage() {
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCheck() {
    if (!resume.trim() || !jd.trim()) {
      setError('Please paste both your resume and a job description.');
      setResult(null);
      return;
    }
    setError(null);
    setResult(computeScore(resume, jd));
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        document.getElementById('ats-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  const circumference = 2 * Math.PI * 54;
  const offset = result ? circumference - (result.score / 100) * circumference : circumference;
  const v = result ? verdict(result.score) : null;
  const VerdictIcon = v?.icon;

  return (
    <>
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Free <span className="text-gradient">ATS Resume Checker</span>
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Paste your resume and a job description. Get an instant ATS keyword-match score — no
            signup needed.
          </p>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <FileText className="h-4 w-4 text-brand" />
                Paste your resume
              </label>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Paste your full resume text here..."
                className="w-full min-h-80 rounded-lg border border-border/50 bg-background p-4 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-y"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {resume.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <Briefcase className="h-4 w-4 text-accent" />
                Paste the job description
              </label>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the JD here..."
                className="w-full min-h-80 rounded-lg border border-border/50 bg-background p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-y"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {jd.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCheck}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-8 py-4 text-base font-medium text-white hover:bg-brand-dark transition"
          >
            <Sparkles className="h-5 w-5" />
            Check ATS Score
          </button>
        </div>
      </section>

      {result && v && VerdictIcon ? (
        <section id="ats-result" className="py-16 px-4 border-t border-border/50">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/50 bg-card p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex-shrink-0">
                  <svg width="140" height="140" viewBox="0 0 120 120" className="-rotate-90">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#6C47FF"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-display font-bold text-foreground">
                      {result.score}
                    </span>
                    <span className="text-xs text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className={'inline-flex items-center gap-2 ' + v.color}>
                    <VerdictIcon className="h-5 w-5" />
                    <span className="font-medium">{v.label}</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-display font-bold text-foreground">
                    ATS Match Score
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Based on keyword overlap between your resume and the job description. A real ATS
                    also weights placement, recency, and formatting — sign up for the full analysis.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Matched keywords ({result.matched.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matched.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No matches found.</span>
                    ) : (
                      result.matched.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-accent/10 text-accent text-xs"
                        >
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 inline-flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-pink-400" />
                    Missing keywords ({result.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing.length === 0 ? (
                      <span className="text-sm text-muted-foreground">All JD keywords matched.</span>
                    ) : (
                      result.missing.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-pink-400/10 text-pink-400 text-xs"
                        >
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-card to-accent/5 p-8 text-center">
            <Sparkles className="h-8 w-8 text-brand mx-auto" />
            <h2 className="mt-4 text-2xl md:text-3xl font-display font-bold text-foreground">
              Want a real ATS analysis with Claude AI?
            </h2>
            <p className="text-muted-foreground mt-3">
              Get full keyword-density scoring, format-issue detection, AI bullet rewrites, and
              comparison against the actual ATS systems Indian companies use (Greenhouse, Lever,
              Workday).
            </p>
            <Link
              href="/sign-up"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-dark transition"
            >
              Sign up free for full analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
