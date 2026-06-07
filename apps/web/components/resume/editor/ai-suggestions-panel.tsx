'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

type Suggestion = {
  type: 'improvement' | 'warning' | 'tip';
  section: string;
  message: string;
};

type Props = { resumeId: string };

export function AiSuggestionsPanel({ resumeId }: Props) {
  const { experience, skills, summary } = useResumeEditor();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/resumes/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, experience, skills, summary }),
      });
      const json = await res.json() as { success: boolean; data?: Suggestion[] };
      if (json.success && json.data) setSuggestions(json.data);
    } finally {
      setLoading(false);
    }
  };

  // Quick local checks (instant, no API call)
  const localChecks: Suggestion[] = [];
  if (!summary) localChecks.push({ type: 'warning', section: 'Summary', message: 'Add a professional summary to make recruiters stop scrolling.' });
  if (experience.length > 0 && experience.some((e) => e.bullets.filter(Boolean).length < 2)) {
    localChecks.push({ type: 'improvement', section: 'Experience', message: 'Some positions have fewer than 2 bullet points. Aim for 3–5 quantified bullets.' });
  }
  if (!skills.languages?.length && !skills.frameworks?.length) {
    localChecks.push({ type: 'warning', section: 'Skills', message: 'Add your technical skills — ATS systems keyword-match against this section.' });
  }
  if (experience.some((e) => e.bullets.some((b) => !b.match(/\d/)))) {
    localChecks.push({ type: 'tip', section: 'Experience', message: 'Quantify your bullets with numbers (%, ₹, users, ms, etc.) — they score 40% higher on ATS.' });
  }

  const Icon = ({ type }: { type: Suggestion['type'] }) => {
    if (type === 'improvement') return <TrendingUp className="w-3.5 h-3.5 text-brand" />;
    if (type === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-accent" />;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => void analyze()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? 'Analyzing…' : 'Get AI Suggestions'}
      </button>

      {/* Instant local checks */}
      {localChecks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick Checks</p>
          {localChecks.map((s, i) => (
            <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-card border border-border">
              <Icon type={s.type} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{s.section}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI suggestions */}
      {suggestions && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">AI Analysis</p>
          {suggestions.map((s, i) => (
            <div key={i} className="flex gap-2 p-2.5 rounded-lg bg-card border border-border">
              <Icon type={s.type} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{s.section}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.message}</p>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-xs text-accent text-center py-2">Looks great! No major issues found.</p>
          )}
        </div>
      )}

      {!suggestions && localChecks.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>Fill in your resume sections to see real-time tips.</p>
        </div>
      )}
    </div>
  );
}
