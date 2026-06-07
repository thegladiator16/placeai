'use client';

import { useState } from 'react';
import { Zap, Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Resume } from '@placeai/db';

type KeywordMatch = { keyword: string; count: number; importance: 'high' | 'medium' | 'low' };
type Suggestion = { section: string; severity: string; message: string; fixSuggestion: string; category: string };

type AtsResult = {
  overallScore: number;
  keywordScore: number | null;
  formatScore: number | null;
  matchedKeywords: KeywordMatch[] | null;
  missingKeywords: KeywordMatch[] | null;
  suggestions: Suggestion[] | null;
  atsCompatibilityNotes: string | null;
};

type Props = {
  resume: Resume;
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{score}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function AtsAnalyzer({ resume }: Props) {
  const [jobDesc, setJobDesc] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const json = await res.json() as { success: boolean; data?: AtsResult; error?: { message: string } };
      if (!json.success || !json.data) throw new Error(json.error?.message ?? 'Analysis failed');
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s: number) => s >= 80 ? '#00D4AA' : s >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job title (e.g. SDE-2)"
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (e.g. Zepto)"
            className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <textarea
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          placeholder="Paste the job description here…"
          rows={6}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand resize-none"
        />
        <button
          onClick={() => void analyze()}
          disabled={loading || jobDesc.trim().length < 50}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? 'Analyzing…' : 'Analyze ATS Score'}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      {result && (
        <div className="space-y-5 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Analysis Results</h3>
            <div className="flex items-center gap-1.5">
              <div
                className="text-2xl font-bold"
                style={{ color: scoreColor(result.overallScore) }}
              >
                {result.overallScore}
              </div>
              <span className="text-muted-foreground text-sm">/100</span>
            </div>
          </div>

          <div className="flex justify-around py-4 bg-card border border-border rounded-xl">
            <ScoreRing score={result.overallScore} label="Overall" color={scoreColor(result.overallScore)} />
            <ScoreRing score={result.keywordScore ?? 0} label="Keywords" color={scoreColor(result.keywordScore ?? 0)} />
            <ScoreRing score={result.formatScore ?? 0} label="Format" color={scoreColor(result.formatScore ?? 0)} />
          </div>

          {result.atsCompatibilityNotes && (
            <p className="text-sm text-muted-foreground leading-relaxed">{result.atsCompatibilityNotes}</p>
          )}

          {(result.missingKeywords?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-foreground">Missing Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingKeywords!.map((kw) => (
                  <span key={kw.keyword} className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">{kw.keyword}</span>
                ))}
              </div>
            </div>
          )}

          {(result.matchedKeywords?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Matched Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedKeywords!.map((kw) => (
                  <span key={kw.keyword} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{kw.keyword}</span>
                ))}
              </div>
            </div>
          )}

          {(result.suggestions?.length ?? 0) > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-brand" />
                <span className="text-sm font-medium text-foreground">Suggestions</span>
              </div>
              <ul className="space-y-2">
                {result.suggestions!.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-medium self-start mt-0.5 ${
                      s.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      s.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>{s.severity}</span>
                    <span className="text-muted-foreground">{s.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
