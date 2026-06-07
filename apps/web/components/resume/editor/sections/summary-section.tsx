'use client';

import { useState } from 'react';
import { useResumeEditor } from '@/lib/stores/resume-editor';
import { Sparkles, Loader2 } from 'lucide-react';

export function SummarySection() {
  const { summary, updateSummary, personalInfo, experience, resumeId } = useResumeEditor();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!resumeId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/resumes/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, personalInfo, experience }),
      });
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        updateSummary(text);
      }
    } catch {
      setError('Failed to generate summary. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Professional Summary</h2>
          <p className="text-sm text-muted-foreground mt-0.5">2–4 sentences summarizing your experience and goals.</p>
        </div>
        <button
          onClick={() => void generate()}
          disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
        >
          {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {generating ? 'Generating…' : 'AI Generate'}
        </button>
      </div>
      <textarea
        value={summary}
        onChange={(e) => updateSummary(e.target.value)}
        rows={5}
        placeholder="Results-driven software engineer with 3+ years of experience building scalable backend systems…"
        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand resize-none transition-colors"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{summary.length} chars</span>
        <span className={summary.length > 600 ? 'text-yellow-500' : ''}>
          {summary.length > 600 ? 'Consider shortening' : 'Ideal: 200–500 chars'}
        </span>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
