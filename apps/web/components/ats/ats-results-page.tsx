'use client';

import { useState } from 'react';
import { motion, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Zap, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Resume, ATSAnalysis, KeywordMatch, ATSSuggestion } from '@placeai/db';

type Props = {
  resume: Resume;
  initialAnalysis: ATSAnalysis | null;
};

function AnimatedScore({ target, color }: { target: number; color: string }) {
  const ref = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const r = 54;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    if (!ref.current || !textRef.current) return;
    const el = ref.current;
    const textEl = textRef.current;
    let current = 0;
    const controls = animate(0, target, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate(value) {
        current = Math.round(value);
        const dash = (current / 100) * circ;
        el.style.strokeDasharray = `${dash} ${circ - dash}`;
        textEl.textContent = String(current);
      },
    });
    return () => controls.stop();
  }, [target, circ]);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth="10" />
        <circle ref={ref} cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray="0 339.3" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span ref={textRef} className="text-4xl font-bold text-foreground">0</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const s = score ?? 0;
  const color = s >= 80 ? '#00D4AA' : s >= 60 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${s}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
      <span className="text-sm font-medium text-foreground w-8 text-right">{s}</span>
    </div>
  );
}

export function AtsResultsPage({ resume, initialAnalysis }: Props) {
  const [jobDesc, setJobDesc] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<number | null>(null);

  const analyze = async () => {
    if (jobDesc.trim().length < 50) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/ats/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: resume.id, jobDescription: jobDesc, jobTitle, companyName: company }),
      });
      const json = await res.json() as { success: boolean; data?: ATSAnalysis; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Analysis failed');
      setAnalysis(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (idx: number, suggestion: ATSSuggestion) => {
    setApplying(idx);
    // Future: call AI to automatically apply the fix to the resume
    await new Promise((r) => setTimeout(r, 800));
    setApplying(null);
  };

  const scoreColor = (s: number) => s >= 80 ? '#00D4AA' : s >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/resume/${resume.id}/edit`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </Link>
        <div className="text-muted-foreground">·</div>
        <h1 className="text-xl font-display font-bold text-foreground">ATS Analysis — {resume.title}</h1>
      </div>

      {/* Input form */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Analyze Against a Job Description</h2>
        <div className="grid grid-cols-2 gap-3">
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title (e.g. SDE-2)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company (e.g. Zepto)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand" />
        </div>
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={5} placeholder="Paste the full job description here…" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand resize-none" />
        <div className="flex items-center gap-3">
          <button onClick={() => void analyze()} disabled={loading || jobDesc.trim().length < 50} className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? 'Analyzing…' : 'Run ATS Analysis'}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Results */}
      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-4">
              <AnimatedScore target={analysis.overallScore} color={scoreColor(analysis.overallScore)} />
              <div className="text-center">
                <p className="font-semibold text-foreground">Overall ATS Score</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.overallScore >= 80 ? 'Excellent — high chance of passing ATS' : analysis.overallScore >= 60 ? 'Good — minor improvements needed' : 'Needs work — follow the suggestions below'}
                </p>
              </div>
            </div>
            <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>
              <ScoreBar label="Keyword Match" score={analysis.keywordScore} />
              <ScoreBar label="Format & Structure" score={analysis.formatScore} />
              <ScoreBar label="Experience" score={analysis.experienceScore} />
              <ScoreBar label="Skills" score={analysis.skillsScore} />
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground">Matched Keywords</h3>
                <span className="text-xs text-muted-foreground ml-auto">{(analysis.matchedKeywords as KeywordMatch[] | null)?.length ?? 0} found</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {((analysis.matchedKeywords as KeywordMatch[] | null) ?? []).map((kw) => (
                  <span key={kw.keyword} className={`text-xs px-2.5 py-1 rounded-full border ${
                    kw.importance === 'high' ? 'bg-accent/15 text-accent border-accent/30' :
                    kw.importance === 'medium' ? 'bg-accent/8 text-accent/80 border-accent/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {kw.keyword}
                  </span>
                ))}
                {!((analysis.matchedKeywords as KeywordMatch[] | null)?.length) && (
                  <p className="text-sm text-muted-foreground">No keywords matched yet.</p>
                )}
              </div>
            </div>

            {/* Missing */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4 text-red-400" />
                <h3 className="font-semibold text-foreground">Missing Keywords</h3>
                <span className="text-xs text-muted-foreground ml-auto">{(analysis.missingKeywords as KeywordMatch[] | null)?.length ?? 0} missing</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {((analysis.missingKeywords as KeywordMatch[] | null) ?? []).map((kw) => (
                  <span key={kw.keyword} className={`text-xs px-2.5 py-1 rounded-full border ${
                    kw.importance === 'high' ? 'bg-red-500/15 text-red-400 border-red-500/30' :
                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {kw.keyword}
                  </span>
                ))}
                {!((analysis.missingKeywords as KeywordMatch[] | null)?.length) && (
                  <p className="text-sm text-muted-foreground">No critical keywords missing!</p>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {((analysis.suggestions as ATSSuggestion[] | null)?.length ?? 0) > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand" />
                  <h3 className="font-semibold text-foreground">Improvement Suggestions</h3>
                </div>
                <Link href={`/resume/${resume.id}/edit`} className="text-xs text-brand hover:underline">Edit Resume →</Link>
              </div>
              <div className="space-y-3">
                {(analysis.suggestions as ATSSuggestion[]).map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                    {s.severity === 'critical' ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> :
                     s.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> :
                     <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{s.section}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          s.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                          s.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-blue-400/10 text-blue-400'
                        }`}>{s.severity}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{s.message}</p>
                      {s.fixSuggestion && <p className="text-xs text-brand mt-1">Fix: {s.fixSuggestion}</p>}
                    </div>
                    <button
                      onClick={() => void applySuggestion(i, s)}
                      disabled={applying === i}
                      className="flex-shrink-0 text-xs px-2.5 py-1 bg-brand/10 text-brand border border-brand/20 rounded-lg hover:bg-brand/20 disabled:opacity-50 transition-colors"
                    >
                      {applying === i ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply Fix'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ATS Compatibility note */}
          {analysis.atsCompatibilityNotes && (
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">ATS Compatibility Notes</p>
                  <p className="text-sm text-muted-foreground mt-1">{analysis.atsCompatibilityNotes}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
